import { NextResponse } from "next/server";
import { dummyEvents } from "@/lib/dummyEvents/events";

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
 * Free-vs-paid eligibility is derived from server-side event data rather than
 * the client's `isPaid` flag, so a paid event can't be reconciled for free.
 *
 * Responds 400 for malformed/missing fields, 404 for an unknown event, 409
 * when the attempt isn't confirmed, 402 when a paid event lacks payment, and
 * 200 with `{ ticketId, deduplicated }` on success.
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

  if (!body.isConfirmed) {
    return NextResponse.json(
      { ok: false, error: "Payment is not yet fully confirmed." },
      { status: 409 },
    );
  }

  // Derive free/paid eligibility from server-side event data, not from the
  // client-supplied `isPaid` flag. This stops a caller from reconciling a paid
  // event for free by simply sending `isPaid: false`.
  //
  // NOTE: `dummyEvents` stands in for a real event store here. For a paid event
  // this still trusts that the client-side wallet flow ran; production must
  // replace this with verification of a settled on-chain payment tied to
  // `attemptId` before issuing the ticket.
  const event = dummyEvents.find((e) => e.id === eventId);
  if (!event) {
    return NextResponse.json(
      { ok: false, error: "Unknown event." },
      { status: 404 },
    );
  }

  if (event.isPaid && !body.isPaid) {
    return NextResponse.json(
      { ok: false, error: "This event requires a completed payment." },
      { status: 402 },
    );
  }

  const existing = processedAttempts.get(attemptId);
  if (existing) {
    // `attemptId` is client-supplied, so bind the dedup lookup to its original
    // event. Otherwise replaying an attemptId with a different eventId would
    // bypass the eligibility checks above and leak another attempt's ticketId.
    if (existing.eventId !== eventId) {
      return NextResponse.json(
        { ok: false, error: "attemptId does not match this event." },
        { status: 409 },
      );
    }
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
