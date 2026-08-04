import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketInfo } from "./TicketInfo";
import type { TicketType } from "@/lib/dummyEvents/events";

const mockSignTransaction = vi.fn();
const mockPreloadWalletSDK = vi.fn();

vi.mock("@/lib/walletSdk", () => ({
  signTransaction: (...args: unknown[]) => mockSignTransaction(...args),
  preloadWalletSDK: (...args: unknown[]) => mockPreloadWalletSDK(...args),
}));

const mockSetWalletConnected = vi.fn();
const mockSetAnonymousBrowsing = vi.fn();
let sessionState = { anonymousBrowsing: false, walletConnected: false };

vi.mock("@/lib/user-session-sync", () => ({
  useUserSessionSync: () => ({
    anonymousBrowsing: sessionState.anonymousBrowsing,
    walletConnected: sessionState.walletConnected,
    setAnonymousBrowsing: mockSetAnonymousBrowsing,
    setWalletConnected: mockSetWalletConnected,
  }),
}));

let availabilityState = { slotsLeft: 10, isSoldOut: false };
vi.mock("@/lib/hooks/useSimulatedAvailability", () => ({
  useSimulatedAvailability: () => availabilityState,
}));

vi.mock("@/hooks/useCooldown", () => ({
  useCooldown: () => ({
    isOnCooldown: false,
    remainingSeconds: 0,
    startCooldown: vi.fn(),
  }),
}));

const mockStartTracking = vi.fn();
vi.mock("@/hooks/useTransactionStatus", () => ({
  useTransactionStatus: () => ({
    status: "idle",
    txHash: null,
    error: null,
    startTracking: mockStartTracking,
    reset: vi.fn(),
    checkConnection: vi.fn(),
  }),
}));

// Radix Dialog isn't the focus of this test — replace with a minimal double
// that exposes the same confirm/close contract used by TicketInfo.
vi.mock("@/app/components/privacy/PrivacyTrustModal", () => ({
  PrivacyTrustModal: ({
    isOpen,
    onConfirm,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <button type="button" onClick={onConfirm}>
        Confirm Trust Prompt
      </button>
    ) : null,
}));

const ticketTypes: TicketType[] = [
  { name: "General Admission", price: 20 },
  { name: "VIP", price: 50 },
];

function renderTicketInfo(overrides: Partial<ComponentProps<typeof TicketInfo>> = {}) {
  return render(
    <TicketInfo
      eventId="test-event"
      ticketTypes={ticketTypes}
      privacyLevel={["Wallet Required"]}
      isPaid
      {...overrides}
    />
  );
}

describe("TicketInfo (event checkout)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState = { anonymousBrowsing: false, walletConnected: false };
    availabilityState = { slotsLeft: 10, isSoldOut: false };
    mockSignTransaction.mockResolvedValue("tx_abc123");
  });

  it("renders every ticket type and defaults to the first one selected", () => {
    renderTicketInfo();
    const first = screen.getByLabelText("General Admission") as HTMLInputElement;
    const second = screen.getByLabelText("VIP") as HTMLInputElement;
    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
  });

  it("increments and decrements quantity within the available slots", async () => {
    const user = userEvent.setup();
    availabilityState = { slotsLeft: 2, isSoldOut: false };
    renderTicketInfo();

    expect(screen.getByText("1")).toBeInTheDocument();

    const decrement = screen.getByRole("button", { name: "Decrease quantity" });
    const increment = screen.getByRole("button", { name: "Increase quantity" });

    // Increment up to the slot cap, then it should not exceed it.
    await user.click(increment);
    expect(screen.getByText("2")).toBeInTheDocument();
    await user.click(increment);
    expect(screen.getByText("2")).toBeInTheDocument(); // capped at slotsLeft

    await user.click(decrement);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("disables the purchase button and shows sold-out messaging when there is no availability", () => {
    availabilityState = { slotsLeft: 0, isSoldOut: true };
    renderTicketInfo();

    expect(screen.getByText("This event is sold out.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sold out/i })).toBeDisabled();
  });

  it("opens the privacy trust prompt, then signs a transaction and starts tracking on confirm for paid events", async () => {
    const user = userEvent.setup();
    renderTicketInfo({ isPaid: true });

    await user.click(screen.getByRole("button", { name: /connect wallet to purchase/i }));
    await user.click(screen.getByText("Confirm Trust Prompt"));

    await waitFor(() => expect(mockSignTransaction).toHaveBeenCalledTimes(1));
    expect(mockSetWalletConnected).toHaveBeenCalledWith(true);
    expect(mockStartTracking).toHaveBeenCalledWith("tx_abc123");
  });

  it("enables anonymous attendance for free events without touching the wallet SDK", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn().mockResolvedValue({ ok: true });
    renderTicketInfo({ isPaid: false, onStatusChange });

    await user.click(screen.getByRole("button", { name: /attend anonymously/i }));
    await user.click(screen.getByText("Confirm Trust Prompt"));

    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith({ isConfirmed: true, isPaid: false }));
    expect(mockSignTransaction).not.toHaveBeenCalled();
    expect(mockSetAnonymousBrowsing).toHaveBeenCalledWith(true);
  });

  it("surfaces a wallet error banner when signing fails", async () => {
    const user = userEvent.setup();
    mockSignTransaction.mockRejectedValueOnce(new Error("Wallet locked"));
    renderTicketInfo({ isPaid: true });

    await user.click(screen.getByRole("button", { name: /connect wallet to purchase/i }));
    await user.click(screen.getByText("Confirm Trust Prompt"));

    expect(await screen.findByText("Wallet locked")).toBeInTheDocument();
  });
});
