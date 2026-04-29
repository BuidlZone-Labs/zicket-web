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

  if (!body.isConfirmed || !body.isPaid) {
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
