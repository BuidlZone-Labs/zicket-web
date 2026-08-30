import { describe, expect, it } from "vitest";

import {
  describeLedgerWindow,
  formatAmount,
  formatTokenAmount,
  hoursToLedgers,
  ledgersRemaining,
  resolveWithdrawGate,
  resolveWithdrawMethod,
  summarizeTokens,
  toBigInt,
  type EventFinance,
  type PostponementState,
  type TokenSettlement,
} from "@/lib/organizer/finance";

const USDC: TokenSettlement = {
  tokenAddress: "CUSDC",
  code: "USDC",
  decimals: 7,
  gross: "10000000000", // 1,000.0000000
  platformFee: "250000000", // 25.0000000
  net: "9750000000",
  withdrawable: "9750000000",
};

const XLM: TokenSettlement = {
  tokenAddress: "CXLM",
  code: "XLM",
  decimals: 7,
  gross: "5000000000",
  platformFee: "125000000",
  net: "4875000000",
  withdrawable: "4875000000",
};

const NO_POSTPONEMENT: PostponementState = {
  status: "none",
  refundChoiceDeadlineLedger: null,
  currentLedger: 52_000_000,
  originalStartsAt: "2026-10-01T18:00:00.000Z",
  rescheduledStartsAt: null,
  refundsClaimed: 0,
};

type GateInput = Parameters<typeof resolveWithdrawGate>[0];

function gateInput(overrides: Partial<GateInput> = {}): GateInput {
  return {
    status: "completed",
    escrowLocked: false,
    tokens: [USDC],
    settlement: null,
    postponement: NO_POSTPONEMENT,
    contractId: "CEVENT",
    ...overrides,
  };
}

describe("toBigInt", () => {
  it("treats missing and malformed amounts as zero rather than throwing", () => {
    expect(toBigInt(null)).toBe(0n);
    expect(toBigInt("")).toBe(0n);
    expect(toBigInt("12.5")).toBe(0n);
    expect(toBigInt("42")).toBe(42n);
  });
});

describe("formatAmount", () => {
  it("scales by the token's decimals and trims trailing fraction zeros", () => {
    expect(formatAmount("10000000000", 7)).toBe("1,000");
    expect(formatAmount("12345678", 7)).toBe("1.2345678");
  });

  it("truncates rather than rounds up, so a balance is never overstated", () => {
    expect(formatAmount("19999999", 7, 2)).toBe("1.99");
  });

  it("keeps full precision on balances that would overflow a JS number", () => {
    // 10^18 stroops — past Number.MAX_SAFE_INTEGER, so any float path loses digits.
    expect(formatAmount("1000000000000000001", 7)).toBe("100,000,000,000.0000001");
  });

  it("renders negatives with a single leading sign", () => {
    expect(formatAmount("-12345678", 7)).toBe("-1.2345678");
  });

  it("appends the token code via formatTokenAmount", () => {
    expect(formatTokenAmount("9750000000", 7, "USDC")).toBe("975 USDC");
  });
});

describe("summarizeTokens", () => {
  it("adds up every position and keeps only the payable tokens", () => {
    const totals = summarizeTokens([USDC, { ...XLM, withdrawable: "0" }]);

    expect(totals.gross).toBe(15_000_000_000n);
    expect(totals.platformFee).toBe(375_000_000n);
    expect(totals.net).toBe(14_625_000_000n);
    expect(totals.withdrawable).toBe(9_750_000_000n);
    expect(totals.withdrawableTokens).toHaveLength(1);
  });

  it("picks the largest-gross token as the display primary", () => {
    expect(summarizeTokens([XLM, USDC]).primary?.code).toBe("USDC");
    expect(summarizeTokens([]).primary).toBeNull();
  });
});

describe("resolveWithdrawMethod", () => {
  it("uses withdraw_revenue for a single payable token", () => {
    expect(resolveWithdrawMethod([USDC])).toBe("withdraw_revenue");
  });

  it("uses withdraw_all_tokens when more than one token is payable", () => {
    expect(resolveWithdrawMethod([USDC, XLM])).toBe("withdraw_all_tokens");
  });

  it("ignores tokens with nothing left to release", () => {
    expect(resolveWithdrawMethod([USDC, { ...XLM, withdrawable: "0" }])).toBe("withdraw_revenue");
  });
});

describe("resolveWithdrawGate", () => {
  it("enables withdrawal for a completed, unlocked event with a balance", () => {
    const gate = resolveWithdrawGate(gateInput());
    expect(gate).toEqual({ enabled: true, code: null, reason: null });
  });

  it("blocks a second withdrawal once a settlement receipt exists", () => {
    const gate = resolveWithdrawGate(
      gateInput({
        settlement: {
          txHash: "abc",
          withdrawnAt: "2026-08-01T10:00:00.000Z",
          method: "withdraw_revenue",
          destination: "GORG",
          tokens: [],
        },
      })
    );

    expect(gate.enabled).toBe(false);
    expect(gate.code).toBe("already_withdrawn");
  });

  it("reports the existing receipt ahead of any other block", () => {
    // An event that is both settled and locked should explain the receipt,
    // not send the organizer chasing an escrow that already paid out.
    const gate = resolveWithdrawGate(
      gateInput({
        status: "locked",
        escrowLocked: true,
        settlement: {
          txHash: "abc",
          withdrawnAt: "2026-08-01T10:00:00.000Z",
          method: "withdraw_revenue",
          destination: "GORG",
          tokens: [],
        },
      })
    );

    expect(gate.code).toBe("already_withdrawn");
  });

  it("blocks while a withdrawal is in flight", () => {
    const gate = resolveWithdrawGate(gateInput(), { isSubmitting: true });
    expect(gate.code).toBe("in_flight");
  });

  it("blocks an event with no deployed contract", () => {
    expect(resolveWithdrawGate(gateInput({ contractId: null })).code).toBe("not_deployed");
    expect(resolveWithdrawGate(gateInput({ status: "draft" })).code).toBe("not_deployed");
  });

  it("blocks a cancelled event, whose escrow is reserved for refunds", () => {
    const gate = resolveWithdrawGate(gateInput({ status: "cancelled" }));
    expect(gate.code).toBe("cancelled");
    expect(gate.reason).toMatch(/refund/i);
  });

  it("names the deadline ledger while a refund window is open", () => {
    const gate = resolveWithdrawGate(
      gateInput({
        status: "postponed",
        postponement: {
          ...NO_POSTPONEMENT,
          status: "pending_refund_window",
          refundChoiceDeadlineLedger: 52_051_840,
        },
      })
    );

    expect(gate.code).toBe("refund_window_open");
    expect(gate.reason).toContain("52,051,840");
  });

  it("blocks an event that has not completed on-chain", () => {
    const gate = resolveWithdrawGate(gateInput({ status: "selling" }));
    expect(gate.code).toBe("not_completed");
    expect(gate.reason).toContain("Tickets on sale");
  });

  it("blocks a completed event whose escrow is still held", () => {
    expect(resolveWithdrawGate(gateInput({ escrowLocked: true })).code).toBe("escrow_locked");
  });

  it("blocks when there is nothing left to release", () => {
    const gate = resolveWithdrawGate(
      gateInput({ tokens: [{ ...USDC, withdrawable: "0" }] })
    );
    expect(gate.code).toBe("nothing_to_withdraw");
  });

  it("accepts a full EventFinance snapshot", () => {
    const finance: EventFinance = {
      eventId: "crypto-art-lagos-2025",
      eventTitle: "Crypto Art Lagos 2025",
      contractId: "CEVENT",
      status: "completed",
      escrowLocked: false,
      platformFeeBps: 250,
      tokens: [USDC],
      tiers: [],
      settlement: null,
      postponement: NO_POSTPONEMENT,
      refreshedAt: "2026-08-30T12:00:00.000Z",
    };

    expect(resolveWithdrawGate(finance).enabled).toBe(true);
  });
});

describe("ledger helpers", () => {
  it("converts hours to ledgers at 5s per ledger", () => {
    expect(hoursToLedgers(1)).toBe(720);
    expect(hoursToLedgers(72)).toBe(51_840);
  });

  it("never returns a zero-ledger window for a sub-ledger duration", () => {
    expect(hoursToLedgers(0.0001)).toBe(1);
  });

  it("reports zero remaining once the deadline has passed or was never set", () => {
    expect(ledgersRemaining(NO_POSTPONEMENT)).toBe(0);
    expect(
      ledgersRemaining({ ...NO_POSTPONEMENT, refundChoiceDeadlineLedger: 51_999_000 })
    ).toBe(0);
  });

  it("describes an open window in wall-clock terms", () => {
    expect(describeLedgerWindow(0)).toBe("closed");
    expect(describeLedgerWindow(720)).toBe("about 1 hr");
    expect(describeLedgerWindow(51_840)).toBe("about 3 days");
  });
});
