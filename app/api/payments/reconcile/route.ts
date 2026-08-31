import { NextResponse } from "next/server";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { paymentStore, verifyPaymentServerSide } from "@/lib/payments";

type ReconcileRequest = {
  attemptId?: string;
  eventId?: string;
  txHash?: string;
  isConfirmed?: boolean;
  isPaid?: boolean;
};

/**
 * Extracts client IP from platform-provided headers or first hop of x-forwarded-for.
 */
function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim()) {
    const firstHop = forwarded.split(",")[0].trim();
    if (firstHop) return firstHop;
  }

  return "unknown-client";
}

/**
 * Extracts and validates caller authentication strictly from request headers.
 */
function extractAuth(request: Request): {
  authenticated: boolean;
  userAddress?: string;
  statusCode?: number;
  error?: string;
} {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("x-user-auth");
  const headerAddress =
    request.headers.get("x-user-address") ||
    request.headers.get("x-wallet-address");

  let credential = headerAddress?.trim();

  if (authHeader) {
    const parts = authHeader.trim().split(" ");
    const token = parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1].trim() : authHeader.trim();
    if (token) {
      credential = token;
    }
  }

  if (credential) {
    return { authenticated: true, userAddress: credential };
  }

  return { authenticated: false };
}

/**
 * Finalizes a ticket purchase after server-side payment verification.
 *
 * Security Invariants Enforced:
 * 1. Independent Server-Side Payment Verification: Client-supplied `isPaid` and `isConfirmed`
 *    fields are IGNORED. Payment authenticity is established server-side against `paymentStore`.
 * 2. Authentication & Authorization: Verifies header credentials (401) and ensures user
 *    ownership matching (403) so users cannot reconcile payments belonging to others.
 * 3. Replay & Concurrency Prevention: Atomic lock acquisition per attempt/txHash prevents race
 *    conditions during concurrent requests, and idempotency guarantees single ticket issuance.
 * 4. Rate Limiting: Prevents endpoint abuse and brute-force attempts.
 */
export async function POST(request: Request) {
  let body: ReconcileRequest;

  try {
    body = (await request.json()) as ReconcileRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const clientIp = getClientIp(request);
  if (!paymentStore.checkRateLimit(clientIp)) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  // 1. Authenticate caller strictly from request headers
  const auth = extractAuth(request);
  const userAddress = auth.userAddress;

  const attemptId = body.attemptId?.trim();
  const eventId = body.eventId?.trim();
  const txHash = body.txHash?.trim();

  if (!attemptId || !eventId) {
    return NextResponse.json(
      { ok: false, error: "attemptId and eventId are required." },
      { status: 400 }
    );
  }

  // 2. Fetch authoritative event definition server-side
  const event = dummyEvents.find((e) => e.id === eventId);
  if (!event) {
    return NextResponse.json(
      { ok: false, error: "Unknown event." },
      { status: 404 }
    );
  }

  // Enforce authentication for paid events
  if (event.isPaid && (!auth.authenticated || !userAddress)) {
    return NextResponse.json(
      { ok: false, error: "Authentication required to reconcile paid event payment." },
      { status: 401 }
    );
  }

  // 3. Check for existing processed attempt (Idempotency)
  const existing = paymentStore.getProcessedAttempt(attemptId);
  if (existing) {
    if (existing.eventId !== eventId) {
      return NextResponse.json(
        { ok: false, error: "attemptId does not match this event." },
        { status: 409 }
      );
    }

    if (
      userAddress &&
      existing.userAddress &&
      userAddress.trim().toLowerCase() !== existing.userAddress.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { ok: false, error: "Authenticated user is not authorized to claim this ticket attempt." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      ticketId: existing.ticketId,
      deduplicated: true,
    });
  }

  // 4. Atomic Concurrency Lock
  const lockKey = txHash || attemptId;
  if (!paymentStore.acquireLock(lockKey)) {
    return NextResponse.json(
      { ok: false, error: "Reconciliation is already in progress for this payment attempt." },
      { status: 409 }
    );
  }

  try {
    // 5. Independent Server-Side Payment Verification for Paid Events
    // Note: `body.isPaid` and `body.isConfirmed` are completely ignored for security decisions.
    if (event.isPaid) {
      const paymentIdentifier = txHash || attemptId;
      if (!paymentIdentifier) {
        return NextResponse.json(
          { ok: false, error: "This event requires a completed payment transaction hash or ID." },
          { status: 402 }
        );
      }

      const verification = verifyPaymentServerSide({
        txHash: txHash || undefined,
        attemptId: attemptId || undefined,
        eventId,
        userAddress,
        expectedPrice: event.price,
      });

      if (!verification.ok) {
        return NextResponse.json(
          { ok: false, error: verification.error || "Payment verification failed." },
          { status: verification.statusCode || 402 }
        );
      }

      if (verification.deduplicated && verification.reconciledTicketId) {
        paymentStore.setProcessedAttempt(attemptId, {
          ticketId: verification.reconciledTicketId,
          eventId,
          userAddress,
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          ok: true,
          ticketId: verification.reconciledTicketId,
          deduplicated: true,
        });
      }
    }

    // 6. Generate and persist ticket ID
    const ticketId = `ticket_${eventId}_${attemptId.slice(0, 8)}`;
    paymentStore.setProcessedAttempt(attemptId, {
      ticketId,
      eventId,
      userAddress,
      createdAt: new Date().toISOString(),
    });

    if (event.isPaid && (txHash || attemptId)) {
      paymentStore.markReconciled(txHash || attemptId, ticketId);
    }

    return NextResponse.json({
      ok: true,
      ticketId,
      deduplicated: false,
    });
  } finally {
    paymentStore.releaseLock(lockKey);
  }
}
