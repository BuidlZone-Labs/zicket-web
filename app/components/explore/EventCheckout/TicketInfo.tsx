"use client";

import { FC, useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  DangerIcon,
  KeyIcon,
  LockIcon,
  MailSecureIcon,
  MinusIcon,
  PasswordProtectedShield,
  PlusIcon,
  ShiedIcon,
} from "@/public/svg/svg";
import { TicketType } from "@/lib/dummyEvents/events";
import { loadWalletSDK, preloadWalletSDK, WalletLoadState } from "@/lib/walletSdk";

type TxStatus = "idle" | "pending" | "confirmed" | "failed";

interface TxState {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  attempts: number;
}

interface TicketInfoProps {
  ticketTypes: TicketType[];
  slotsLeft: number;
  privacyLevel: string[];
  isPaid: boolean;
  onStatusChange?: (status: { isConfirmed: boolean; isPaid: boolean }) => void;
}

const POLL_INTERVAL_MS = 3_000;
const MAX_ATTEMPTS = 20; // ~1 min

// Replace with your real endpoint when ready.
async function fetchTxStatus(
  txHash: string
): Promise<{ status: "pending" | "confirmed" | "failed"; error?: string }> {
  const res = await fetch(`/api/transactions/${txHash}/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function TxBanner({ txState }: { txState: TxState }) {
  if (txState.status === "idle") return null;

  const configs = {
    pending: {
      icon: <Loader2 className="size-5 animate-spin text-[#6917AF] shrink-0 mt-0.5" />,
      wrapper: "bg-[#F5EEFF] border-[#D4ADFC]",
      text: "text-[#6917AF]",
      title: "Transaction Pending",
      message: "Confirming your ticket purchase on-chain…",
    },
    confirmed: {
      icon: <CheckCircle2 className="size-5 text-[#039855] shrink-0 mt-0.5" />,
      wrapper: "bg-[#ECFDF3] border-[#6CE9A6]",
      text: "text-[#027A48]",
      title: "Transaction Confirmed",
      message: "Your ticket has been confirmed. You're all set!",
    },
    failed: {
      icon: <XCircle className="size-5 text-[#D92D20] shrink-0 mt-0.5" />,
      wrapper: "bg-[#FEF3F2] border-[#FDA29B]",
      text: "text-[#B42318]",
      title: "Transaction Failed",
      message: txState.error ?? "Something went wrong. Please try again.",
    },
  } as const;

  const cfg = configs[txState.status as keyof typeof configs];
  if (!cfg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${cfg.wrapper}`}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.title}</p>
        <p className={`text-xs leading-relaxed opacity-90 ${cfg.text}`}>{cfg.message}</p>
        {txState.txHash && txState.status !== "pending" && (
          <a
            href={`https://solscan.io/tx/${txState.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs underline underline-offset-2 mt-1 ${cfg.text}`}
          >
            View on Solscan ↗
          </a>
        )}
        {txState.txHash && txState.status === "pending" && (
          <p className={`text-xs font-mono opacity-60 truncate ${cfg.text}`}>
            {txState.txHash.slice(0, 12)}…{txState.txHash.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}

export const TicketInfo: FC<TicketInfoProps> = ({
  ticketTypes,
  slotsLeft,
  privacyLevel,
  isPaid,
  onStatusChange,
}) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>(ticketTypes[0].name);
  const [availableTickets] = useState(slotsLeft);
  const [quantity, setQuantity] = useState(1);

  // Wallet SDK loading state (connecting phase)
  const [walletState, setWalletState] = useState<WalletLoadState>({
    isLoading: false,
    error: null,
  });

  // Transaction lifecycle state
  const [txState, setTxState] = useState<TxState>({
    status: "idle",
    txHash: null,
    error: null,
    attempts: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const txStateRef = useRef(txState);
  txStateRef.current = txState;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (txHash: string) => {
      const current = txStateRef.current;

      if (
        current.status === "confirmed" ||
        current.status === "failed" ||
        current.attempts >= MAX_ATTEMPTS
      ) {
        stopPolling();
        // Timed out
        if (current.attempts >= MAX_ATTEMPTS && current.status === "pending") {
          setTxState((s) => ({
            ...s,
            status: "failed",
            error: "Transaction timed out. Please check your wallet.",
          }));
          onStatusChange?.({ isConfirmed: false, isPaid });
        }
        return;
      }

      try {
        const result = await fetchTxStatus(txHash);

        setTxState((s) => ({
          ...s,
          status: result.status,
          error: result.error ?? null,
          attempts: s.attempts + 1,
        }));

        if (result.status === "confirmed") {
          stopPolling();
          onStatusChange?.({ isConfirmed: true, isPaid });
        } else if (result.status === "failed") {
          stopPolling();
          onStatusChange?.({ isConfirmed: false, isPaid });
        }
      } catch {
        // Network hiccup — keep polling, just increment attempts
        setTxState((s) => ({ ...s, attempts: s.attempts + 1 }));
      }
    },
    [isPaid, onStatusChange, stopPolling]
  );

  const startTracking = useCallback(
    (txHash: string) => {
      stopPolling();
      setTxState({ status: "pending", txHash, error: null, attempts: 0 });
      // Poll immediately then on interval
      poll(txHash);
      intervalRef.current = setInterval(() => poll(txHash), POLL_INTERVAL_MS);
    },
    [poll, stopPolling]
  );

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleWalletClick = async () => {
    setWalletState({ isLoading: true, error: null });
    setTxState({ status: "idle", txHash: null, error: null, attempts: 0 });

    try {
      // temporarily mock it:  const txHash = "mock_tx_" + Date.now()
      const txHash: string = await loadWalletSDK();
      setWalletState({ isLoading: false, error: null });

      // Begin lifecycle tracking
      startTracking(txHash);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load wallet. Please try again.";
      setWalletState({ isLoading: false, error: message });
    }
  };

  const incrementQuantity = () => {
    if (quantity < availableTickets) setQuantity((p) => p + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((p) => p - 1);
  };

  const isButtonDisabled =
    walletState.isLoading ||
    txState.status === "pending" ||
    txState.status === "confirmed";

  const buttonLabel = () => {
    if (walletState.isLoading) return <><Loader2 className="animate-spin" size={20} /><span>Connecting…</span></>;
    if (txState.status === "pending") return <><Loader2 className="animate-spin" size={20} /><span>Confirming…</span></>;
    if (txState.status === "confirmed") return <><CheckCircle2 size={20} /><span>Ticket Confirmed</span></>;
    return (
      <>
        <PasswordProtectedShield />
        <span>{isPaid ? "Connect Wallet to Purchase" : "Attend Anonymously"}</span>
      </>
    );
  };

  return (
    <div className="p-8 border border-[#E9E9E9] rounded-xl space-y-6 dark:border-[#232323] w-full">
      <p className="text-2xl font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
        Ticket Info
      </p>
      <hr className="w-full h-0.5" />

      <form className="space-y-10">
        {/* Ticket type selection */}
        <div>
          {ticketTypes.map((ticket, index) => {
            const isSelected = selectedTicket === ticket.name;
            return (
              <div key={ticket.name + index} className="space-y-3 mb-6 last:mb-0">
                <label
                  htmlFor={ticket.name}
                  className={`cursor-pointer flex px-6 py-4 border rounded-xl justify-between items-center transition-colors ease-in-out duration-300 ${
                    isSelected ? "border-[#6917AF]" : "border-[#E4E5E6]"
                  }`}
                >
                  <p className={`font-semibold text-base transition-colors ease-in-out duration-300 ${isSelected ? "text-[#6917AF]" : ""}`}>
                    {ticket.name}
                  </p>
                  <div className="relative size-5">
                    <input
                      type="radio"
                      name="ticketType"
                      id={ticket.name}
                      className="appearance-none border-[#E4E5E6] size-5 rounded-sm transition-colors ease-in-out duration-300 checked:bg-[#6917AF] border-[1.5px]"
                      onChange={() => setSelectedTicket(ticket.name)}
                      checked={isSelected}
                    />
                    <Check
                      size={16}
                      className="absolute top-1/2 left-1/2 text-white -translate-1/2 transition-colors ease-in-out duration-300"
                    />
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {/* Quantity */}
        <div className="flex gap-6 flex-col">
          <label className="text-[#7D7D7D] font-medium">Quantity</label>
          <div className="flex justify-between lg:items-center gap-6 flex-col lg:flex-row">
            <div className="flex py-5 px-6.5 bg-[#F9FAFB] border border-[#F0F2F5] dark:bg-[#121212] dark:border-[#191919] rounded-4xl w-fit gap-10 justify-between max-w-[12.8rem] min-w-[12.8rem]">
              <button
                disabled={quantity === 1}
                type="button"
                onClick={decrementQuantity}
                className={quantity === 1 ? "text-[#667185] cursor-not-allowed" : "text-[#6917AF] cursor-pointer"}
              >
                <MinusIcon />
              </button>
              <p className="text-xl font-semibold text-[#6917AF]">{quantity}</p>
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity === availableTickets}
                className={quantity === availableTickets ? "text-[#667185] cursor-not-allowed" : "text-[#6917AF] cursor-pointer"}
              >
                <PlusIcon />
              </button>
            </div>
            <div>
              <p className="text-[#667185] text-sm font-normal">
                Only{" "}
                <span className="font-semibold text-[#6917AF]">{availableTickets} Slots</span>{" "}
                Left!
              </p>
              <p className="text-sm text-[#667185]">Don't miss it</p>
            </div>
          </div>
        </div>

        {/* Privacy level */}
        <div className="flex gap-6 items-center">
          <p className="font-medium text-[#7D7D7D]">Privacy Level:</p>
          <div className="flex gap-4 flex-wrap">
            {privacyLevel.map((level) => (
              <div
                key={level}
                className="flex gap-1 border-[0.5px] rounded-lg border-[#E9E9E9] px-3 py-1.5 items-center"
              >
                {level === "Wallet Required" ? (
                  <KeyIcon />
                ) : level === "Verified Access" ? (
                  <LockIcon />
                ) : (
                  <ShiedIcon />
                )}
                <p className="text-[#5C6170] text-xs font-medium">{level}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email reminder */}
        <div
          role="form"
          className="bg-[#F4F4F4] p-5 flex flex-col w-full gap-y-5 rounded-[12px]"
        >
          <label aria-label="Want a reminder? (Optional)" className="text-[#7D7D7D] font-medium">
            Want a reminder? (Optional)
          </label>
          <div className="relative w-full">
            <input
              aria-label="email address"
              type="text"
              placeholder="Email address"
              className="block p-4 pr-10 truncate rounded-[12px] border border-[#606163] outline-0 placeholder:text-[#98A2B3] text-[#606163] w-full"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <MailSecureIcon />
            </div>
          </div>
        </div>

        {/* Secure payment notice */}
        <div className="bg-[#F2FFF2] dark:bg-[#131313] dark:text-[#0BD330] text-[#0ABA2A] py-3 px-5 gap-4 flex">
          <DangerIcon />
          <p className="text-xs font-medium">Secure & Instant Payment</p>
        </div>

        {/* ── Transaction status banner — renders between notice and button ── */}
        <TxBanner txState={txState} />

        {/* CTA button */}
        <div>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={handleWalletClick}
            onMouseEnter={preloadWalletSDK}
            onFocus={preloadWalletSDK}
            className="py-4 px-6 bg-[#6917AF] text-[#FCFDFD] flex w-full items-center justify-center font-bold rounded-full gap-3 cursor-pointer hover:bg-[#6917AF]/95 duration-200 ease-in-out transition dark:bg-[#751AC6] dark:text-[#0F0F0F] dark:hover:bg-[#751AC6]/95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buttonLabel()}
          </button>

          {/* Wallet connection error (separate from tx error) */}
          {walletState.error && (
            <p className="mt-2 text-sm text-red-500">{walletState.error}</p>
          )}

          {/* Retry button — only shown after a failed tx */}
          {txState.status === "failed" && (
            <button
              type="button"
              onClick={() => setTxState({ status: "idle", txHash: null, error: null, attempts: 0 })}
              className="mt-3 w-full text-center text-sm text-[#6917AF] underline underline-offset-2 cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      </form>
    </div>
  );
};