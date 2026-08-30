import { NextResponse } from "next/server";

import { getEventFinance, recordSettlement } from "@/lib/organizer/financeStore";
import type { WithdrawMethod } from "@/lib/organizer/finance";

/**
 * SECURITY(TODO): these handlers are unauthenticated. There is no session or
 * organizer-ownership check, because this app has no auth to check against —
 * `lib/oauth.ts` is an empty stub and the login/signup pages call into it. Any
 * caller can therefore read an event's finances and write its settlement
 * receipt, and `destination` is taken from the request rather than derived
 * from a signed-in organizer.
 *
 * This must be closed before the settlement backend is real: resolve the
 * caller's session, verify they own `eventId`, derive `destination` from that
 * account, and verify `txHash` actually succeeded on-chain. Validating the
 * hash alone would not help while the endpoint stays open — anyone could
 * replay someone else's genuine withdrawal.
 */
/** Settlement figures move with every sale — never let a CDN hold them. */
export const dynamic = "force-dynamic";

const WITHDRAW_METHODS: WithdrawMethod[] = ["withdraw_revenue", "withdraw_all_tokens"];

/**
 * Current escrow position for one event: gross taken in, platform fee, the
 * withdrawable balance per token, live per-tier sales, any settlement receipt
 * already on file, and the postponement/refund-window state.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  if (!eventId) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  return NextResponse.json(getEventFinance(eventId));
}

type SettlementRequest = {
  txHash?: string;
  method?: string;
  destination?: string;
};

/**
 * Records a settlement receipt once the organizer's `withdraw_revenue` /
 * `withdraw_all_tokens` transaction has confirmed on-chain. Idempotent per
 * event: replaying the same withdrawal returns the stored receipt with
 * `deduplicated: true` rather than issuing a second one.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  let body: SettlementRequest;
  try {
    body = (await request.json()) as SettlementRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const txHash = body.txHash?.trim();
  const destination = body.destination?.trim();
  const method = body.method as WithdrawMethod | undefined;

  if (!eventId || !txHash || !destination) {
    return NextResponse.json(
      { error: "eventId, txHash and destination are required." },
      { status: 400 },
    );
  }

  if (!method || !WITHDRAW_METHODS.includes(method)) {
    return NextResponse.json(
      { error: `method must be one of: ${WITHDRAW_METHODS.join(", ")}.` },
      { status: 400 },
    );
  }

  const finance = getEventFinance(eventId);

  // Guard against a receipt being written for an escrow the contract would
  // never have released — the client is not the authority on this.
  if (!finance.settlement && finance.status !== "completed") {
    return NextResponse.json(
      { error: "Escrow for this event has not been released yet." },
      { status: 409 },
    );
  }

  const { receipt, deduplicated } = recordSettlement(eventId, {
    txHash,
    method,
    destination,
  });

  return NextResponse.json({
    deduplicated,
    settlement: receipt,
    finance: getEventFinance(eventId),
  });
}
