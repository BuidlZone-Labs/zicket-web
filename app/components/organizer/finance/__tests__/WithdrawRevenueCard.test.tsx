import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "@/lib/user-session-sync";
import type { EventFinance, TokenSettlement } from "@/lib/organizer/finance";

const { connectMock, withdrawRevenueMock, withdrawAllTokensMock, publicKeyRef } = vi.hoisted(() => ({
  connectMock: vi.fn(),
  withdrawRevenueMock: vi.fn(async () => "TXHASH"),
  withdrawAllTokensMock: vi.fn(async () => "TXHASH"),
  publicKeyRef: { current: "GORGANIZER" as string | null },
}));

vi.mock("@/hooks/useStellarWallet", () => ({
  useStellarWallet: () => ({
    publicKey: publicKeyRef.current,
    connect: connectMock,
    preload: vi.fn(),
    withdrawRevenue: withdrawRevenueMock,
    withdrawAllTokens: withdrawAllTokensMock,
  }),
}));

import { WithdrawRevenueCard } from "../WithdrawRevenueCard";

const USDC: TokenSettlement = {
  tokenAddress: "CUSDCTOKEN",
  code: "USDC",
  decimals: 7,
  gross: "10000000000",
  platformFee: "250000000",
  net: "9750000000",
  withdrawable: "9750000000",
};

const XLM: TokenSettlement = {
  tokenAddress: "CXLMTOKEN",
  code: "XLM",
  decimals: 7,
  gross: "5000000000",
  platformFee: "125000000",
  net: "4875000000",
  withdrawable: "4875000000",
};

function buildFinance(overrides: Partial<EventFinance> = {}): EventFinance {
  return {
    eventId: "crypto-art-lagos-2025",
    eventTitle: "Crypto Art Lagos 2025",
    contractId: "CEVENTCONTRACT",
    status: "completed",
    escrowLocked: false,
    platformFeeBps: 250,
    tokens: [USDC],
    tiers: [],
    settlement: null,
    postponement: {
      status: "none",
      refundChoiceDeadlineLedger: null,
      currentLedger: 52_000_000,
      originalStartsAt: "2026-10-01T18:00:00.000Z",
      rescheduledStartsAt: null,
      refundsClaimed: 0,
    },
    refreshedAt: "2026-08-30T12:00:00.000Z",
    ...overrides,
  };
}

function renderCard(finance: EventFinance, onSettled = vi.fn()) {
  return render(
    <SessionProvider>
      <WithdrawRevenueCard finance={finance} onSettled={onSettled} />
    </SessionProvider>
  );
}

const withdrawButton = () => screen.getByTestId("withdraw-revenue-button");

beforeEach(() => {
  publicKeyRef.current = "GORGANIZER";
  vi.clearAllMocks();
  // The card polls tx status after a successful submit — keep it pending so a
  // test never falls through to the settlement POST.
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ status: "pending" }), { status: 200 }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WithdrawRevenueCard button state", () => {
  it("enables withdrawal for a completed event with a released balance", () => {
    renderCard(buildFinance());

    const button = withdrawButton();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent("Withdraw Revenue");
    expect(button).not.toHaveAttribute("data-block-reason");
  });

  it("offers the batch entrypoint when more than one token is payable", () => {
    renderCard(buildFinance({ tokens: [USDC, XLM] }));

    expect(withdrawButton()).toHaveTextContent("Withdraw All Tokens");
  });

  it("disables withdrawal while the event has not completed on-chain", () => {
    renderCard(buildFinance({ status: "selling", tokens: [{ ...USDC, withdrawable: "0" }] }));

    const button = withdrawButton();
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-block-reason", "not_completed");
    expect(screen.getByRole("note")).toHaveTextContent(/marked completed on-chain/i);
  });

  it("names the contract state in the explanation when the event is mid-flight", () => {
    renderCard(buildFinance({ status: "locked", escrowLocked: true }));

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "not_completed");
    expect(screen.getByRole("note")).toHaveTextContent("Escrow locked");
  });

  it("disables withdrawal when a completed event's escrow is still held", () => {
    renderCard(buildFinance({ escrowLocked: true }));

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "escrow_locked");
    expect(screen.getByRole("note")).toHaveTextContent(/still holds this escrow/i);
  });

  it("disables withdrawal and names the deadline while a refund window is open", () => {
    renderCard(
      buildFinance({
        status: "postponed",
        postponement: {
          status: "pending_refund_window",
          refundChoiceDeadlineLedger: 52_051_840,
          currentLedger: 52_000_000,
          originalStartsAt: "2026-10-01T18:00:00.000Z",
          rescheduledStartsAt: null,
          refundsClaimed: 4,
        },
      })
    );

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "refund_window_open");
    expect(screen.getByRole("note")).toHaveTextContent("52,051,840");
  });

  it("disables withdrawal for a cancelled event whose escrow funds refunds", () => {
    renderCard(buildFinance({ status: "cancelled" }));

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "cancelled");
    expect(screen.getByRole("note")).toHaveTextContent(/reserved for attendee refunds/i);
  });

  it("disables withdrawal before the event contract is deployed", () => {
    renderCard(buildFinance({ status: "draft", contractId: null }));

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "not_deployed");
  });

  it("disables withdrawal when the released balance is zero", () => {
    renderCard(buildFinance({ tokens: [{ ...USDC, withdrawable: "0" }] }));

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "nothing_to_withdraw");
  });

  it("associates the explanation with the button for assistive tech", () => {
    renderCard(buildFinance({ escrowLocked: true }));

    expect(withdrawButton()).toHaveAttribute("aria-describedby", "withdraw-gate-reason");
    expect(screen.getByRole("note")).toHaveAttribute("id", "withdraw-gate-reason");
  });
});

describe("WithdrawRevenueCard settlement receipt", () => {
  const settled = buildFinance({
    tokens: [{ ...USDC, withdrawable: "0" }],
    settlement: {
      txHash: "abcdef0123456789abcdef0123456789",
      withdrawnAt: "2026-08-12T14:30:00.000Z",
      method: "withdraw_revenue",
      destination: "GORGANIZER",
      tokens: [{ amount: "9750000000", decimals: 7, code: "USDC" }],
    },
  });

  it("blocks a second withdrawal and shows the receipt instead", () => {
    renderCard(settled);

    expect(withdrawButton()).toHaveAttribute("data-block-reason", "already_withdrawn");
    expect(screen.getByTestId("settlement-receipt")).toBeInTheDocument();
  });

  it("shows the settled amount, entrypoint and timestamp", () => {
    renderCard(settled);

    const receipt = screen.getByTestId("settlement-receipt");
    expect(receipt).toHaveTextContent("975 USDC");
    expect(receipt).toHaveTextContent("withdraw_revenue()");
    expect(receipt.querySelector("time")).toHaveAttribute(
      "dateTime",
      "2026-08-12T14:30:00.000Z"
    );
  });
});

describe("WithdrawRevenueCard submission", () => {
  it("signs withdraw_revenue with the payable token's address", async () => {
    const user = userEvent.setup();
    renderCard(buildFinance());

    await user.click(withdrawButton());

    await waitFor(() => expect(withdrawRevenueMock).toHaveBeenCalledTimes(1));
    expect(withdrawRevenueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contractId: "CEVENTCONTRACT",
        eventId: "crypto-art-lagos-2025",
        tokenAddress: "CUSDCTOKEN",
      })
    );
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("signs withdraw_all_tokens for a multi-token escrow", async () => {
    const user = userEvent.setup();
    renderCard(buildFinance({ tokens: [USDC, XLM] }));

    await user.click(withdrawButton());

    await waitFor(() => expect(withdrawAllTokensMock).toHaveBeenCalledTimes(1));
    expect(withdrawRevenueMock).not.toHaveBeenCalled();
  });

  it("connects the organizer wallet first when none is connected", async () => {
    publicKeyRef.current = null;
    connectMock.mockResolvedValue({
      walletId: "freighter",
      publicKey: "GORGANIZER",
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    const user = userEvent.setup();
    renderCard(buildFinance());

    await user.click(withdrawButton());

    await waitFor(() => expect(connectMock).toHaveBeenCalledWith("freighter"));
    expect(withdrawRevenueMock).toHaveBeenCalledWith(
      expect.objectContaining({ wallet: expect.objectContaining({ publicKey: "GORGANIZER" }) })
    );
  });

  it("disables the button and surfaces the wallet error when signing is rejected", async () => {
    withdrawRevenueMock.mockRejectedValueOnce(new Error("Transaction signing was rejected."));

    const user = userEvent.setup();
    renderCard(buildFinance());

    await user.click(withdrawButton());

    expect(await screen.findByText("Transaction signing was rejected.")).toBeInTheDocument();
    // The action stays available so the organizer can retry after re-approving.
    expect(withdrawButton()).toBeEnabled();
  });

  it("blocks a duplicate submit while the first withdrawal is confirming", async () => {
    const user = userEvent.setup();
    renderCard(buildFinance());

    await user.click(withdrawButton());

    await waitFor(() =>
      expect(withdrawButton()).toHaveAttribute("data-block-reason", "in_flight")
    );
    expect(withdrawButton()).toBeDisabled();
    expect(withdrawRevenueMock).toHaveBeenCalledTimes(1);
  });
});
