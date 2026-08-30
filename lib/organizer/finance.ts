/**
 * Shared types + pure helpers for the organizer settlement dashboard.
 *
 * Money is carried the way the Soroban contract carries it: an integer string
 * in the token's smallest unit plus that token's `decimals`. Nothing here ever
 * converts an amount to a JS `number` — a 7-decimal balance past ~900M would
 * silently lose precision — so every arithmetic path below goes through
 * `bigint` and only formats to a string at the edge.
 */

/**
 * Where the event's escrow sits in the contract lifecycle. Only `completed`
 * releases funds to the organizer; every other state is a reason the withdraw
 * action stays disabled.
 */
export type EscrowContractStatus =
  | "draft"
  | "selling"
  | "locked"
  | "postponed"
  | "completed"
  | "cancelled";

/** Human labels for {@link EscrowContractStatus}, used in badges and copy. */
export const ESCROW_STATUS_LABEL: Record<EscrowContractStatus, string> = {
  draft: "Not deployed",
  selling: "Tickets on sale",
  locked: "Escrow locked",
  postponed: "Postponed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface TokenAmount {
  /** Integer string in the token's smallest unit. Never a float. */
  amount: string;
  decimals: number;
  /** Display code, e.g. "USDC". */
  code: string;
}

/** Per-token escrow position — the contract settles each token separately. */
export interface TokenSettlement {
  /** Stellar asset contract address (`C…`) for this token. */
  tokenAddress: string;
  code: string;
  decimals: number;
  /** Gross taken in for this token, smallest unit. */
  gross: string;
  /** Platform fee accrued against `gross`, smallest unit. */
  platformFee: string;
  /** `gross - platformFee`, smallest unit — what the organizer is owed. */
  net: string;
  /** Portion of `net` the contract will release right now, smallest unit. */
  withdrawable: string;
}

/** One ticket tier's live sales position. */
export interface TierSales {
  tierId: string;
  name: string;
  /** Unit price in the tier's token, smallest unit. */
  unitPrice: string;
  tokenCode: string;
  decimals: number;
  sold: number;
  /** `null` for an uncapped tier. */
  capacity: number | null;
  /** `sold * unitPrice`, smallest unit. */
  gross: string;
}

/** Receipt for a settlement that already cleared on-chain. */
export interface SettlementReceipt {
  txHash: string;
  /** ISO-8601. */
  withdrawnAt: string;
  /** Which contract entrypoint produced this receipt. */
  method: WithdrawMethod;
  /** Destination account the contract paid out to. */
  destination: string;
  /** What was actually paid out, per token. */
  tokens: TokenAmount[];
}

export type WithdrawMethod = "withdraw_revenue" | "withdraw_all_tokens";

export type PostponementStatus = "none" | "pending_refund_window" | "rescheduled";

export interface PostponementState {
  status: PostponementStatus;
  /**
   * Ledger sequence after which attendees can no longer choose a refund.
   * `null` until a postponement is initiated. Ledger-based (not wall-clock)
   * because that is what the contract enforces.
   */
  refundChoiceDeadlineLedger: number | null;
  /** Current ledger, so the UI can show how much of the window is left. */
  currentLedger: number;
  /** ISO-8601 start the event was originally scheduled for. */
  originalStartsAt: string;
  /** ISO-8601 rescheduled start, once finalized. */
  rescheduledStartsAt: string | null;
  /** Attendees who took the refund option while the window has been open. */
  refundsClaimed: number;
}

/** Full payload returned by `GET /api/organizer/events/:eventId/finance`. */
export interface EventFinance {
  eventId: string;
  eventTitle: string;
  /** Soroban event contract this settlement is bound to. */
  contractId: string | null;
  status: EscrowContractStatus;
  /**
   * True while the contract still holds funds it won't release — set
   * independently of `status` so a completed event with an open dispute can
   * still be blocked.
   */
  escrowLocked: boolean;
  platformFeeBps: number;
  tokens: TokenSettlement[];
  tiers: TierSales[];
  settlement: SettlementReceipt | null;
  postponement: PostponementState;
  /** ISO-8601 timestamp of this snapshot, for the "as of" line. */
  refreshedAt: string;
}

/** Mainnet Stellar ledgers close about every 5 seconds. */
export const LEDGER_SECONDS = 5;

/* -------------------------------------------------------------------------- */
/* Amount helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Parses an integer-string amount, tolerating `null`/empty/garbage as 0n. */
export function toBigInt(amount: string | null | undefined): bigint {
  if (!amount) return 0n;
  try {
    return BigInt(amount);
  } catch {
    return 0n;
  }
}

export function sumAmounts(amounts: Array<string | null | undefined>): bigint {
  return amounts.reduce<bigint>((acc, a) => acc + toBigInt(a), 0n);
}

/**
 * Renders a smallest-unit amount as a decimal string, e.g.
 * `formatAmount("12345678", 7)` → `"1.2345678"`. Trailing zeros in the
 * fraction are trimmed, and `maxFractionDigits` caps (truncates, never rounds
 * up) how much of the fraction is shown so a display can't overstate a balance.
 */
export function formatAmount(
  amount: string | bigint | null | undefined,
  decimals: number,
  maxFractionDigits = decimals
): string {
  const raw = typeof amount === "bigint" ? amount : toBigInt(amount);
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;

  const scale = 10n ** BigInt(decimals);
  const whole = abs / scale;
  const fraction = abs % scale;

  const wholeStr = whole.toLocaleString("en-US");
  let out = wholeStr;

  if (decimals > 0) {
    const padded = fraction.toString().padStart(decimals, "0");
    const trimmed = padded.slice(0, Math.max(0, maxFractionDigits)).replace(/0+$/, "");
    if (trimmed) out = `${wholeStr}.${trimmed}`;
  }

  return negative ? `-${out}` : out;
}

/** `formatAmount` with the token code appended, e.g. `"1,500.25 USDC"`. */
export function formatTokenAmount(
  amount: string | bigint | null | undefined,
  decimals: number,
  code: string,
  maxFractionDigits = 2
): string {
  return `${formatAmount(amount, decimals, maxFractionDigits)} ${code}`;
}

/* -------------------------------------------------------------------------- */
/* Derived totals                                                             */
/* -------------------------------------------------------------------------- */

export interface SettlementTotals {
  gross: bigint;
  platformFee: bigint;
  net: bigint;
  withdrawable: bigint;
  /** Tokens carrying a non-zero withdrawable balance. */
  withdrawableTokens: TokenSettlement[];
  /** Display decimals/code borrowed from the largest-gross token. */
  primary: TokenSettlement | null;
  /**
   * True when the positions span more than one asset (or precision). The sums
   * above are then a count of unlike units, not a spendable figure — callers
   * that display money must render per-token amounts instead. Aggregate-as-
   * predicate uses (`withdrawable > 0n`) stay valid either way.
   */
  isMixedAsset: boolean;
}

/**
 * Rolls the per-token positions into headline figures.
 *
 * The sums are only a meaningful amount when every position is the same asset;
 * an event that sold tiers in, say, USDC and XLM would otherwise report their
 * addition as a single number. `isMixedAsset` flags exactly that case and
 * `primary` names a real token, so the UI can never imply a conversion the
 * contract never performed.
 */
export function summarizeTokens(tokens: TokenSettlement[]): SettlementTotals {
  const primary = tokens.reduce<TokenSettlement | null>((best, t) => {
    if (!best) return t;
    return toBigInt(t.gross) > toBigInt(best.gross) ? t : best;
  }, null);

  const isMixedAsset =
    new Set(tokens.map((t) => t.tokenAddress)).size > 1 ||
    new Set(tokens.map((t) => t.decimals)).size > 1;

  return {
    gross: sumAmounts(tokens.map((t) => t.gross)),
    platformFee: sumAmounts(tokens.map((t) => t.platformFee)),
    net: sumAmounts(tokens.map((t) => t.net)),
    withdrawable: sumAmounts(tokens.map((t) => t.withdrawable)),
    withdrawableTokens: tokens.filter((t) => toBigInt(t.withdrawable) > 0n),
    primary,
    isMixedAsset,
  };
}

/**
 * Picks the contract entrypoint for a withdrawal: a single token settles
 * through `withdraw_revenue`, several through `withdraw_all_tokens` so the
 * organizer signs once instead of once per token.
 */
export function resolveWithdrawMethod(tokens: TokenSettlement[]): WithdrawMethod {
  return summarizeTokens(tokens).withdrawableTokens.length > 1
    ? "withdraw_all_tokens"
    : "withdraw_revenue";
}

/* -------------------------------------------------------------------------- */
/* Withdraw gating                                                            */
/* -------------------------------------------------------------------------- */

export type WithdrawBlockCode =
  | "already_withdrawn"
  | "in_flight"
  | "not_deployed"
  | "cancelled"
  | "refund_window_open"
  | "not_completed"
  | "escrow_locked"
  | "nothing_to_withdraw";

export interface WithdrawGate {
  enabled: boolean;
  /** `null` only when `enabled` is true. */
  code: WithdrawBlockCode | null;
  /** Tooltip/explainer text. `null` only when `enabled` is true. */
  reason: string | null;
}

const ENABLED: WithdrawGate = { enabled: true, code: null, reason: null };

/**
 * Single source of truth for whether "Withdraw Revenue" is clickable, and why
 * not when it isn't. Pure and exhaustively ordered so the button, its tooltip,
 * and the tests all agree — the UI never re-derives any part of this.
 *
 * Checks run most-specific first: an already-settled event reports its receipt
 * rather than "escrow locked", and an open refund window outranks the generic
 * "not completed" message because it names an actionable deadline.
 */
export function resolveWithdrawGate(
  finance: Pick<
    EventFinance,
    "status" | "escrowLocked" | "tokens" | "settlement" | "postponement" | "contractId"
  >,
  options: { isSubmitting?: boolean } = {}
): WithdrawGate {
  const { status, escrowLocked, tokens, settlement, postponement, contractId } = finance;

  if (settlement) {
    return {
      enabled: false,
      code: "already_withdrawn",
      reason: "Revenue for this event has already been withdrawn. See the settlement receipt below.",
    };
  }

  if (options.isSubmitting) {
    return {
      enabled: false,
      code: "in_flight",
      reason: "A withdrawal is already in flight. Wait for it to confirm before submitting another.",
    };
  }

  if (!contractId || status === "draft") {
    return {
      enabled: false,
      code: "not_deployed",
      reason: "This event has no escrow contract yet. Publish the event to deploy one.",
    };
  }

  if (status === "cancelled") {
    return {
      enabled: false,
      code: "cancelled",
      reason: "This event was cancelled — the escrow is reserved for attendee refunds and can't be withdrawn.",
    };
  }

  if (postponement.status === "pending_refund_window") {
    const deadline = postponement.refundChoiceDeadlineLedger;
    return {
      enabled: false,
      code: "refund_window_open",
      reason: deadline
        ? `Attendees can still claim a refund until ledger ${deadline.toLocaleString("en-US")}. Escrow unlocks once that window closes.`
        : "Attendees can still claim a refund for this postponement. Escrow unlocks once that window closes.",
    };
  }

  if (status !== "completed") {
    return {
      enabled: false,
      code: "not_completed",
      reason: `Escrow is released once the event is marked completed on-chain. Current contract status: ${ESCROW_STATUS_LABEL[status]}.`,
    };
  }

  if (escrowLocked) {
    return {
      enabled: false,
      code: "escrow_locked",
      reason: "The contract still holds this escrow. It unlocks once the settlement period ends.",
    };
  }

  if (summarizeTokens(tokens).withdrawable <= 0n) {
    return {
      enabled: false,
      code: "nothing_to_withdraw",
      reason: "There's no withdrawable balance on this event right now.",
    };
  }

  return ENABLED;
}

/* -------------------------------------------------------------------------- */
/* Postponement helpers                                                       */
/* -------------------------------------------------------------------------- */

/** Ledgers left in the refund window; `0` once it has closed or never opened. */
export function ledgersRemaining(postponement: PostponementState): number {
  const { refundChoiceDeadlineLedger, currentLedger } = postponement;
  if (!refundChoiceDeadlineLedger) return 0;
  return Math.max(0, refundChoiceDeadlineLedger - currentLedger);
}

/** Rough wall-clock rendering of a ledger count, e.g. `"about 2 days"`. */
export function describeLedgerWindow(ledgers: number): string {
  if (ledgers <= 0) return "closed";
  const seconds = ledgers * LEDGER_SECONDS;
  const hours = seconds / 3600;
  if (hours < 1) return `about ${Math.max(1, Math.round(seconds / 60))} min`;
  if (hours < 48) return `about ${Math.round(hours)} hr`;
  return `about ${Math.round(hours / 24)} days`;
}

/**
 * Converts a wall-clock duration into the ledger count the contract expects,
 * with a floor of one ledger. A non-finite input floors too rather than
 * propagating `NaN` — the result becomes a deadline ledger inside a signed
 * transaction, so it must always be a usable number.
 */
export function hoursToLedgers(hours: number): number {
  if (!Number.isFinite(hours)) return 1;
  return Math.max(1, Math.round((hours * 3600) / LEDGER_SECONDS));
}
