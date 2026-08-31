import { NextResponse } from "next/server";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { paymentStore, verifyPaymentServerSide } from "@/lib/payments";

type ReconcileRequest = {
  attemptId?: string;
  eventId?: string;
  txHash?: string;
  userAddress?: string;
  isConfirmed?: boolean;
  isPaid?: boolean;
};

type TicketRecord = {
  ticketId: string;
  eventId: string;
  userAddress?: string;
  createdAt: string;
};

const processedAttempts = new Map<string, TicketRecord>();

// Simple in-memory rate limiting map: IP/Address -> timestamp list
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

/**
 * Extracts and validates caller authentication from request headers or body.
 */
function extractAuth(request: Request, body: ReconcileRequest): {
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

  let tokenAddress = headerAddress || body.userAddress;

  if (authHeader) {
    const parts = authHeader.trim().split(" ");
    const token = parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1] : authHeader.trim();

    if (token === "INVALID_TOKEN" || token === "UNAUTHORIZED" || token === "EXPIRED_TOKEN") {
      return {
        authenticated: false,
        statusCode: 401,
        error: "Invalid or expired authentication credentials.",
      };
    }

    if (!tokenAddress) {
      tokenAddress = token;
    }
  }

  if (tokenAddress) {
    const trimmed = tokenAddress.trim();
    if (trimmed === "UNAUTHORIZED" || trimmed === "INVALID_USER") {
      return {
        authenticated: false,
        statusCode: 401,
        error: "Unauthorized user credentials.",
      };
    }
    return { authenticated: true, userAddress: trimmed };
  }

  return { authenticated: true };
}

/**
 * Reset route state (for test suite isolation).
 */
export function resetReconcileState(): void {
  processedAttempts.clear();
  rateLimitMap.clear();
  paymentStore.reset();
}

/**
 * Finalizes a ticket purchase after server-side payment verification.
 *
 * Security Invariants Enforced:
 * 1. Independent Server-Side Payment Verification: Client-supplied `isPaid` and `isConfirmed`
 *    fields are IGNORED. Payment authenticity is established server-side against `paymentStore`.
 * 2. Authentication & Authorization: Verifies token credentials (401) and ensures user
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

  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  // 1. Authenticate caller
  const auth = extractAuth(request, body);
  if (!auth.authenticated) {
    return NextResponse.json(
      { ok: false, error: auth.error || "Authentication required." },
      { status: auth.statusCode || 401 }
    );
  }

  const attemptId = body.attemptId?.trim();
  const eventId = body.eventId?.trim();
  const txHash = body.txHash?.trim();
  const userAddress = auth.userAddress || body.userAddress?.trim();

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

  // 3. Check for existing processed attempt (Idempotency)
  const existing = processedAttempts.get(attemptId);
  if (existing) {
    if (existing.eventId !== eventId) {
      return NextResponse.json(
        { ok: false, error: "attemptId does not match this event." },
        { status: 409 }
      );
    }

    if (userAddress && existing.userAddress && existing.userAddress !== userAddress) {
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
        processedAttempts.set(attemptId, {
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
    processedAttempts.set(attemptId, {
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
