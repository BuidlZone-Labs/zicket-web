import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "@/lib/user-session-sync";
import type { EventFinance } from "@/lib/organizer/finance";

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "crypto-art-lagos-2025" }),
}));

vi.mock("@/hooks/useStellarWallet", () => ({
  useStellarWallet: () => ({
    publicKey: "GORGANIZER",
    connect: vi.fn(),
    preload: vi.fn(),
    withdrawRevenue: vi.fn(async () => "TX"),
    withdrawAllTokens: vi.fn(async () => "TX"),
    postponeEvent: vi.fn(async () => "TX"),
    setRefundChoiceDeadline: vi.fn(async () => "TX"),
    finalizeEventStart: vi.fn(async () => "TX"),
  }),
}));

import EventFinancePage from "../page";

const FINANCE: EventFinance = {
  eventId: "crypto-art-lagos-2025",
  eventTitle: "Crypto Art Lagos 2025",
  contractId: "CEVENTCONTRACTADDRESS",
  status: "completed",
  escrowLocked: false,
  platformFeeBps: 250,
  tokens: [
    {
      tokenAddress: "CUSDCTOKEN",
      code: "USDC",
      decimals: 7,
      gross: "10000000000",
      platformFee: "250000000",
      net: "9750000000",
      withdrawable: "9750000000",
    },
  ],
  tiers: [
    {
      tierId: "tier-ga",
      name: "General Admission",
      unitPrice: "250000000",
      tokenCode: "USDC",
      decimals: 7,
      sold: 320,
      capacity: 400,
      gross: "80000000000",
    },
    {
      tierId: "tier-vip",
      name: "VIP",
      unitPrice: "900000000",
      tokenCode: "USDC",
      decimals: 7,
      sold: 50,
      capacity: 50,
      gross: "45000000000",
    },
  ],
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
};

function mockFinanceResponse(finance: EventFinance = FINANCE, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      ok
        ? new Response(JSON.stringify(finance), { status: 200 })
        : new Response("boom", { status: 500 })
    )
  );
}

const renderPage = () =>
  render(
    <SessionProvider>
      <EventFinancePage />
    </SessionProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EventFinancePage", () => {
  it("shows a loading state before the first snapshot lands", () => {
    mockFinanceResponse();
    renderPage();

    expect(screen.getByText(/loading settlement data/i)).toBeInTheDocument();
  });

  it("renders the escrow breakdown, tier sales and postponement controls", async () => {
    mockFinanceResponse();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: /Crypto Art Lagos 2025 — Finance/i })
    ).toBeInTheDocument();

    // Headline figures: gross 1,000 → 25 fee (2.5%) → 975 net, all withdrawable.
    const summary = screen.getByLabelText("Escrow summary");
    expect(within(summary).getByLabelText(/^Gross revenue: 1,000 USDC$/)).toBeInTheDocument();
    expect(
      within(summary).getByLabelText(/^Platform fee \(2.5%\): 25 USDC$/)
    ).toBeInTheDocument();
    expect(within(summary).getByLabelText(/^Net to organizer: 975 USDC$/)).toBeInTheDocument();
    expect(
      within(summary).getByLabelText(/^Available to withdraw: 975 USDC$/)
    ).toBeInTheDocument();

    expect(screen.getByText(/370 tickets sold across 2 tiers/i)).toBeInTheDocument();
    expect(screen.getByText("Sold out")).toBeInTheDocument();

    expect(screen.getByTestId("withdraw-revenue-button")).toBeEnabled();
    expect(screen.getByTestId("initiate-postponement")).toBeEnabled();
    expect(screen.getByTestId("finalize-event-date")).toBeDisabled();
  });

  it("surfaces a retryable error when the snapshot can't be loaded", async () => {
    mockFinanceResponse(FINANCE, false);
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't load settlement data/i);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const callsBefore = fetchMock.mock.calls.length;

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("never adds unlike assets together in the headline or tier totals", async () => {
    // 1,000 USDC + 500 XLM must never render as "1,500" of anything.
    mockFinanceResponse({
      ...FINANCE,
      tokens: [
        FINANCE.tokens[0],
        {
          tokenAddress: "CXLMTOKEN",
          code: "XLM",
          decimals: 7,
          gross: "5000000000",
          platformFee: "125000000",
          net: "4875000000",
          withdrawable: "4875000000",
        },
      ],
      tiers: [
        FINANCE.tiers[0],
        { ...FINANCE.tiers[1], tokenCode: "XLM", gross: "5000000000" },
      ],
    });
    renderPage();

    const summary = await screen.findByLabelText("Escrow summary");
    // Each card names both assets separately rather than one summed figure.
    expect(within(summary).getByLabelText("Gross revenue: 1,000 USDC, 500 XLM")).toBeInTheDocument();
    expect(
      within(summary).getByLabelText("Available to withdraw: 975 USDC, 487.5 XLM")
    ).toBeInTheDocument();
    expect(within(summary).queryByLabelText(/1,500/)).not.toBeInTheDocument();
    expect(screen.getByText(/never added together/i)).toBeInTheDocument();

    // The tier footer totals per token for the same reason: 8,000 USDC and
    // 500 XLM, never their sum.
    const tierFooter = screen.getByText("Total gross").closest("footer");
    expect(tierFooter).toHaveTextContent("8,000 USDC");
    expect(tierFooter).toHaveTextContent("500 XLM");
    expect(tierFooter).not.toHaveTextContent("8,500");
  });

  it("swaps the postponement action to 'extend' while a refund window is open", async () => {
    mockFinanceResponse({
      ...FINANCE,
      status: "postponed",
      tokens: [{ ...FINANCE.tokens[0], withdrawable: "0" }],
      postponement: {
        ...FINANCE.postponement,
        status: "pending_refund_window",
        refundChoiceDeadlineLedger: 52_051_840,
        refundsClaimed: 7,
      },
    });
    renderPage();

    expect(await screen.findByTestId("extend-refund-window")).toBeInTheDocument();
    expect(screen.queryByTestId("initiate-postponement")).not.toBeInTheDocument();
    expect(screen.getByText("Refund window open")).toBeInTheDocument();
    expect(screen.getByTestId("withdraw-revenue-button")).toBeDisabled();
  });
});
