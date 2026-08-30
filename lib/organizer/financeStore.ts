import { dummyEvents } from "@/lib/dummyEvents/events";
import {
  hoursToLedgers,
  toBigInt,
  type EscrowContractStatus,
  type EventFinance,
  type PostponementState,
  type SettlementReceipt,
  type TierSales,
  type TokenSettlement,
  type WithdrawMethod,
} from "./finance";

/**
 * In-process stand-in for the settlement backend, mirroring the shape the real
 * indexer will return so only this file changes when it lands. It is
 * deliberately the same pattern the existing mocked routes use
 * (`app/api/payments/reconcile`, `app/api/transactions/[txHash]/status`):
 * module-level `Map`s, no persistence, reset on redeploy.
 *
 * TODO(backend): replace `buildBaseline` with a fetch against the settlement
 * service; keep the overlay maps only until writes are owned server-side.
 */

/** Stellar's canonical asset precision — matches USDC and XLM on-chain. */
const TOKEN_DECIMALS = 7;
const SCALE = 10n ** BigInt(TOKEN_DECIMALS);

/** Zicket's platform cut, in basis points. */
export const PLATFORM_FEE_BPS = 250;

/** Sample asset contract addresses, so the UI renders realistic `C…` ids. */
const TOKEN_ADDRESSES: Record<string, string> = {
  USDC: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  XLM: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
};

/** How often a simulated ticket sale lands, so the tier table visibly ticks. */
const SALE_INTERVAL_MS = 12_000;

const bootedAt = Date.now();

/** Overlays applied on top of the derived baseline. */
const settlements = new Map<string, SettlementReceipt>();
const postponements = new Map<string, Pick<PostponementState, "status" | "refundChoiceDeadlineLedger" | "rescheduledStartsAt">>();

/** Stable 32-bit hash so every derived figure is the same on every request. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STATUS_CYCLE: EscrowContractStatus[] = [
  "completed",
  "selling",
  "locked",
  "completed",
  "postponed",
  "cancelled",
];

/**
 * Every contract state has to be reachable from the UI without a live chain,
 * so status is derived from a stable hash of the event id rather than from the
 * dummy dates (which are all in the past and would make every event
 * `completed`). Deterministic, so a given event always renders the same state.
 */
function deriveStatus(eventId: string): EscrowContractStatus {
  return STATUS_CYCLE[hash(`status:${eventId}`) % STATUS_CYCLE.length];
}

/** Ledger sequence advances ~1 per 5s; anchored to a hash so it looks live. */
function currentLedger(eventId: string): number {
  const base = 52_000_000 + (hash(`ledger:${eventId}`) % 500_000);
  return base + Math.floor((Date.now() - bootedAt) / 5_000);
}

function titleFor(eventId: string): string {
  const known = dummyEvents.find((e) => e.id === eventId);
  if (known) return known.title;
  return eventId
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

/** Tier definitions, from real event data when we have it, derived when not. */
function deriveTiers(eventId: string): TierSales[] {
  const known = dummyEvents.find((e) => e.id === eventId);
  const seed = hash(`tiers:${eventId}`);

  const definitions =
    known?.ticketTypes.length
      ? known.ticketTypes.map((t) => ({
          name: t.name,
          price: typeof t.price === "number" ? t.price : Number(t.price) || 0,
        }))
      : [
          { name: "General Admission", price: 25 },
          { name: "VIP", price: 90 },
        ];

  return definitions.map((definition, index) => {
    const tierSeed = hash(`${eventId}:${definition.name}`);
    const capacity = 60 + (tierSeed % 240);
    const baseSold = Math.min(capacity, 12 + (tierSeed % Math.max(1, capacity - 12)));
    // Simulated live sales: one more seat every SALE_INTERVAL_MS, staggered per
    // tier so the table doesn't move in lockstep. Capped at capacity.
    const elapsedSales = Math.floor((Date.now() - bootedAt) / (SALE_INTERVAL_MS * (index + 1)));
    const sold = Math.min(capacity, baseSold + elapsedSales);

    // Tiers beyond the second settle in XLM, so multi-token events (and the
    // `withdraw_all_tokens` path) are reachable in the UI.
    const tokenCode = index >= 2 && seed % 2 === 0 ? "XLM" : "USDC";
    const unitPrice = BigInt(Math.round(definition.price)) * SCALE;

    return {
      tierId: `${eventId}--${definition.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: definition.name,
      unitPrice: unitPrice.toString(),
      tokenCode,
      decimals: TOKEN_DECIMALS,
      sold,
      capacity,
      gross: (unitPrice * BigInt(sold)).toString(),
    };
  });
}

/**
 * Rolls tier gross up into per-token escrow positions and applies the platform
 * fee. `withdrawable` is zero unless the contract would actually release the
 * funds — the same condition the withdraw button gates on, so the two can't
 * disagree.
 */
function deriveTokens(tiers: TierSales[], status: EscrowContractStatus): TokenSettlement[] {
  const byCode = new Map<string, bigint>();
  for (const tier of tiers) {
    byCode.set(tier.tokenCode, (byCode.get(tier.tokenCode) ?? 0n) + toBigInt(tier.gross));
  }

  const released = status === "completed";

  return [...byCode.entries()]
    .filter(([, gross]) => gross > 0n)
    .map(([code, gross]) => {
      const platformFee = (gross * BigInt(PLATFORM_FEE_BPS)) / 10_000n;
      const net = gross - platformFee;
      return {
        tokenAddress: TOKEN_ADDRESSES[code] ?? TOKEN_ADDRESSES.USDC,
        code,
        decimals: TOKEN_DECIMALS,
        gross: gross.toString(),
        platformFee: platformFee.toString(),
        net: net.toString(),
        withdrawable: released ? net.toString() : "0",
      };
    })
    // Descending by gross, returning 0 on ties: a comparator that never
    // reports equality lets equal-gross rows swap between polls.
    .sort((a, b) => {
      const left = toBigInt(a.gross);
      const right = toBigInt(b.gross);
      if (left === right) return 0;
      return right > left ? 1 : -1;
    });
}

function derivePostponement(eventId: string, status: EscrowContractStatus): PostponementState {
  const ledger = currentLedger(eventId);
  const known = dummyEvents.find((e) => e.id === eventId);
  const parsed = known ? Date.parse(known.date.replace(".", "")) : NaN;
  const originalStartsAt = Number.isNaN(parsed)
    ? new Date(bootedAt + 30 * 86_400_000).toISOString()
    : new Date(parsed).toISOString();

  const overlay = postponements.get(eventId);
  if (overlay) {
    return {
      status: overlay.status,
      refundChoiceDeadlineLedger: overlay.refundChoiceDeadlineLedger,
      currentLedger: ledger,
      originalStartsAt,
      rescheduledStartsAt: overlay.rescheduledStartsAt,
      refundsClaimed: hash(`refunds:${eventId}`) % 12,
    };
  }

  // A `postponed` contract arrives with its refund window already open.
  if (status === "postponed") {
    return {
      status: "pending_refund_window",
      refundChoiceDeadlineLedger: ledger + hoursToLedgers(72),
      currentLedger: ledger,
      originalStartsAt,
      rescheduledStartsAt: null,
      refundsClaimed: hash(`refunds:${eventId}`) % 12,
    };
  }

  return {
    status: "none",
    refundChoiceDeadlineLedger: null,
    currentLedger: ledger,
    originalStartsAt,
    rescheduledStartsAt: null,
    refundsClaimed: 0,
  };
}

function contractIdFor(eventId: string, status: EscrowContractStatus): string | null {
  if (status === "draft") return null;
  // Deterministic, well-formed-looking 56-char `C…` id for the mock.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let out = "C";
  for (let i = 0; i < 55; i++) {
    // Re-hash per position rather than iterating an LCG — a 32-bit LCG's low
    // bits cycle short enough to produce a visibly repeating id.
    out += alphabet[hash(`contract:${eventId}:${i}`) % alphabet.length];
  }
  return out;
}

/** Builds the full snapshot for an event, overlays included. */
export function getEventFinance(eventId: string): EventFinance {
  const status = deriveStatus(eventId);
  const tiers = deriveTiers(eventId);
  const postponement = derivePostponement(eventId, status);

  // A postponement initiated after the fact re-locks a completed escrow — the
  // contract can't release funds attendees may still refund out of.
  const effectiveStatus: EscrowContractStatus =
    postponement.status === "pending_refund_window" && status !== "cancelled"
      ? "postponed"
      : status;

  return {
    eventId,
    eventTitle: titleFor(eventId),
    contractId: contractIdFor(eventId, effectiveStatus),
    status: effectiveStatus,
    // `locked` is the one derived state where the contract holds funds past
    // completion; everything else follows from `status`.
    escrowLocked: effectiveStatus === "locked",
    platformFeeBps: PLATFORM_FEE_BPS,
    tokens: deriveTokens(tiers, effectiveStatus),
    tiers,
    settlement: settlements.get(eventId) ?? null,
    postponement,
    refreshedAt: new Date().toISOString(),
  };
}

export interface RecordSettlementInput {
  txHash: string;
  method: WithdrawMethod;
  destination: string;
}

/**
 * Persists the settlement receipt for an event. Idempotent by event: replaying
 * a withdrawal returns the receipt already on file instead of overwriting it,
 * so a double-submit can't rewrite the payout record.
 */
export function recordSettlement(
  eventId: string,
  input: RecordSettlementInput
): { receipt: SettlementReceipt; deduplicated: boolean } {
  const existing = settlements.get(eventId);
  if (existing) return { receipt: existing, deduplicated: true };

  const finance = getEventFinance(eventId);
  const receipt: SettlementReceipt = {
    txHash: input.txHash,
    withdrawnAt: new Date().toISOString(),
    method: input.method,
    destination: input.destination,
    tokens: finance.tokens
      .filter((token) => toBigInt(token.withdrawable) > 0n)
      .map((token) => ({
        amount: token.withdrawable,
        decimals: token.decimals,
        code: token.code,
      })),
  };

  settlements.set(eventId, receipt);
  return { receipt, deduplicated: false };
}

export type PostponementAction =
  | { action: "initiate"; refundWindowHours: number }
  | { action: "extend_window"; refundWindowHours: number }
  | { action: "finalize"; rescheduledStartsAt: string };

/**
 * Applies a postponement transition. Returns an error message rather than
 * throwing so the route can map it to a 409 without a try/catch.
 */
export function applyPostponement(
  eventId: string,
  input: PostponementAction
): { ok: true; finance: EventFinance } | { ok: false; error: string } {
  const finance = getEventFinance(eventId);

  if (finance.settlement) {
    return { ok: false, error: "This event has already been settled and can't be postponed." };
  }
  if (finance.status === "cancelled") {
    return { ok: false, error: "A cancelled event can't be postponed." };
  }

  const ledger = finance.postponement.currentLedger;

  if (input.action === "finalize") {
    // Finalizing commits a rescheduled start, which only exists once a
    // postponement has been declared — otherwise this would flip a perfectly
    // normal event to "rescheduled" without one.
    if (finance.postponement.status !== "pending_refund_window") {
      return { ok: false, error: "There's no open refund window to finalize." };
    }

    const parsed = Date.parse(input.rescheduledStartsAt);
    if (Number.isNaN(parsed)) {
      return { ok: false, error: "A valid new start date is required." };
    }
    if (parsed <= Date.now()) {
      return { ok: false, error: "The new start date must be in the future." };
    }
    postponements.set(eventId, {
      status: "rescheduled",
      refundChoiceDeadlineLedger: finance.postponement.refundChoiceDeadlineLedger,
      rescheduledStartsAt: new Date(parsed).toISOString(),
    });
    return { ok: true, finance: getEventFinance(eventId) };
  }

  if (input.action === "extend_window" && finance.postponement.status !== "pending_refund_window") {
    return { ok: false, error: "There's no open refund window to extend." };
  }

  // Re-initiating over an open window would overwrite its deadline, and
  // nothing stops the replacement landing earlier than the ledger attendees
  // were already promised. Extending is the only legal way to move it.
  if (input.action === "initiate" && finance.postponement.status === "pending_refund_window") {
    return {
      ok: false,
      error: "A refund window is already open for this event. Extend it instead of re-opening it.",
    };
  }

  const hours = input.refundWindowHours;
  if (!Number.isFinite(hours) || hours <= 0 || hours > 720) {
    return { ok: false, error: "The refund window must be between 1 and 720 hours." };
  }

  const existingDeadline = finance.postponement.refundChoiceDeadlineLedger ?? 0;
  // Extending measures from where the window currently ends, matching what
  // PostponementCard signs — anchoring on the current ledger here would record
  // a different deadline than the transaction actually carries.
  const anchor =
    input.action === "extend_window" ? Math.max(ledger, existingDeadline) : ledger;
  const nextDeadline = anchor + hoursToLedgers(hours);

  if (input.action === "extend_window" && nextDeadline <= existingDeadline) {
    return { ok: false, error: "The new deadline must be later than the current one." };
  }

  postponements.set(eventId, {
    status: "pending_refund_window",
    refundChoiceDeadlineLedger: nextDeadline,
    rescheduledStartsAt: null,
  });
  return { ok: true, finance: getEventFinance(eventId) };
}
