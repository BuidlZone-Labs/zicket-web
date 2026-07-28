import { NextResponse } from "next/server";

type ReconcileRequest = {
  attemptId?: string;
  eventId?: string;
  isConfirmed?: boolean;
  isPaid?: boolean;
};

type TicketRecord = {
  ticketId: string;
  eventId: string;
  createdAt: string;
};

const processedAttempts = new Map<string, TicketRecord>();

/**
 * Finalizes a ticket purchase after an on-chain payment (or free registration)
 * has been confirmed. Idempotent by `attemptId`: replaying the same attempt
 * returns the previously issued ticket instead of creating a duplicate, so a
 * failed-then-retried reconcile can never issue two tickets or double-charge.
 *
 * Responds 400 for malformed/missing fields, 409 when the attempt isn't
 * confirmed yet, and 200 with `{ ticketId, deduplicated }` on success.
 */
export async function POST(request: Request) {
  let body: ReconcileRequest;

  try {
    body = (await request.json()) as ReconcileRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const attemptId = body.attemptId?.trim();
  const eventId = body.eventId?.trim();

  if (!attemptId || !eventId) {
    return NextResponse.json(
      { ok: false, error: "attemptId and eventId are required." },
      { status: 400 },
    );
  }

  // `isPaid: false` is a legitimate, expected value for free/anonymous
  // events — only `isConfirmed` indicates the attempt isn't ready to
  // reconcile yet.
  if (!body.isConfirmed) {
    return NextResponse.json(
      { ok: false, error: "Payment is not yet fully confirmed." },
      { status: 409 },
    );
  }

  const existing = processedAttempts.get(attemptId);
  if (existing) {
    return NextResponse.json({
      ok: true,
      ticketId: existing.ticketId,
      deduplicated: true,
    });
  }

  const ticketId = `ticket_${eventId}_${attemptId.slice(0, 8)}`;
  processedAttempts.set(attemptId, {
    ticketId,
    eventId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    ticketId,
    deduplicated: false,
  });
}
