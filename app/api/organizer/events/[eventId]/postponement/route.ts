import { NextResponse } from "next/server";

import { applyPostponement, type PostponementAction } from "@/lib/organizer/financeStore";

export const dynamic = "force-dynamic";

type PostponementRequest = {
  action?: string;
  refundWindowHours?: number;
  rescheduledStartsAt?: string;
};

/**
 * Mirrors the organizer's postponement transaction into the settlement view:
 * `initiate` opens the refund-choice window, `extend_window` pushes its
 * deadline ledger out, and `finalize` commits the rescheduled start date.
 *
 * Responds 400 for a malformed action and 409 when the transition isn't legal
 * for the event's current contract state (already settled, cancelled, or no
 * open window to extend).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  if (!eventId) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  let body: PostponementRequest;
  try {
    body = (await request.json()) as PostponementRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  let input: PostponementAction;
  switch (body.action) {
    case "initiate":
    case "extend_window":
      input = {
        action: body.action,
        refundWindowHours: Number(body.refundWindowHours),
      };
      break;
    case "finalize":
      input = {
        action: "finalize",
        rescheduledStartsAt: body.rescheduledStartsAt ?? "",
      };
      break;
    default:
      return NextResponse.json(
        { error: "action must be one of: initiate, extend_window, finalize." },
        { status: 400 },
      );
  }

  const result = applyPostponement(eventId, input);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ finance: result.finance });
}
