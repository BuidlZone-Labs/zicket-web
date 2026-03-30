"use client";

import { FC, useState, useEffect, useRef } from "react";
import { Check, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSimulatedAvailability } from "@/lib/hooks/useSimulatedAvailability";
import {
  DangerIcon,
  KeyIcon,
  LockIcon,
  PasswordProtectedShield,
  PlusIcon,
  MinusIcon,
  ShiedIcon,
} from "@/public/svg/svg";
import { TicketType } from "@/lib/dummyEvents/events";
import { loadWalletSDK, preloadWalletSDK, WalletLoadState } from "@/lib/walletSdk";

type TxStatus = "idle" | "pending" | "confirmed" | "failed";
type PaymentStatus = "idle" | "processing" | "failed";

interface TxState {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  attempts: number;
}

interface TicketInfoProps {
  eventId: string;
  ticketTypes: TicketType[];
  privacyLevel: string[];
  isPaid: boolean;
  paymentStatus?: PaymentStatus;
  paymentError?: string | null;
  onStatusChange?: (status: {
    isConfirmed: boolean;
    isPaid: boolean;
  }) => Promise<{ ok: boolean; error?: string }> | { ok: boolean; error?: string };
}

const POLL_INTERVAL_MS = 3000;

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
      icon: <Loader2 className="size-5 animate-spin text-[#6917AF]" />,
      wrapper: "bg-[#F5EEFF] border-[#D4ADFC]",
      text: "text-[#6917AF]",
      title: "Transaction Pending",
      message: "Confirming your ticket purchase on-chain…",
    },
    confirmed: {
      icon: <CheckCircle2 className="size-5 text-[#039855]" />,
      wrapper: "bg-[#ECFDF3] border-[#6CE9A6]",
      text: "text-[#027A48]",
      title: "Transaction Confirmed",
      message: "Your ticket has been confirmed. You're all set!",
    },
    failed: {
      icon: <XCircle className="size-5 text-[#D92D20]" />,
      wrapper: "bg-[#FEF3F2] border-[#FDA29B]",
      text: "text-[#B42318]",
      title: "Transaction Failed",
      message: txState.error ?? "Something went wrong. Please try again.",
    },
  } as const;

  const cfg = configs[txState.status];
  if (!cfg) return null;

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 ${cfg.wrapper}`}>
      {cfg.icon}
      <div className="flex-1 space-y-1">
        <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.title}</p>
        <p className={`text-xs ${cfg.text}`}>{cfg.message}</p>

        {txState.txHash && txState.status !== "pending" && (
          
          <a  href={`https://solscan.io/tx/${txState.txHash}`}
            target="_blank"
            className={`text-xs underline ${cfg.text}`}
          >
            View on Solscan ↗
          </a>
        )}
      </div>
    </div>
  );
}

export const TicketInfo: FC<TicketInfoProps> = ({
  eventId,
  ticketTypes,
  privacyLevel,
  isPaid,
  paymentStatus = "idle",
  paymentError = null,
  onStatusChange,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string>(
    ticketTypes[0].name
  );
  const { slotsLeft: liveSlotsLeft, isSoldOut } = useSimulatedAvailability(eventId);
  const [quantity, setQuantity] = useState(1);

  const isProcessingPayment = paymentStatus === "processing";
  const hasPaymentFailed = paymentStatus === "failed";

  const [walletState, setWalletState] = useState<WalletLoadState>({
    isLoading: false,
    error: null,
  });

  const [txState, setTxState] = useState<TxState>({
    status: "idle",
    txHash: null,
    error: null,
    attempts: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const incrementQuantity = () => {
    if (!isSoldOut && quantity < liveSlotsLeft) {
      setQuantity((prev) => prev + 1);
    }
  };

  // Fix: avoid synchronous setState in effect by clamping during increment
  // instead of reacting to liveSlotsLeft changes via useEffect.
  // We only need to clamp when liveSlotsLeft drops below current quantity,
  // which we handle safely by checking inside the handlers and on render.
  const clampedQuantity = liveSlotsLeft > 0 ? Math.min(quantity, liveSlotsLeft) : quantity;

  const poll = async (txHash: string) => {
    try {
      const result = await fetchTxStatus(txHash);

      setTxState((s) => ({
        ...s,
        status: result.status,
        error: result.error ?? null,
        attempts: s.attempts + 1,
      }));

      if (result.status !== "pending") {
        stopPolling();
        await onStatusChange?.({
          isConfirmed: result.status === "confirmed",
          isPaid,
        });
      }
    } catch {
      setTxState((s) => ({ ...s, attempts: s.attempts + 1 }));
    }
  };

  const startTracking = (txHash: string) => {
    setTxState({ status: "pending", txHash, error: null, attempts: 0 });
    poll(txHash);
    intervalRef.current = setInterval(() => poll(txHash), POLL_INTERVAL_MS);
  };

  useEffect(() => () => stopPolling(), []);

  const handlePrimaryClick = async () => {
    if (isProcessingPayment || txState.status === "pending") return;

    setWalletState({ isLoading: true, error: null });
    setTxState({ status: "idle", txHash: null, error: null, attempts: 0 });

    if (isSoldOut || isProcessingPayment) return;

    try {
      if (isPaid) {
        const txHash = await loadWalletSDK();
        setWalletState({ isLoading: false, error: null });
        startTracking(txHash);
      } else {
        await onStatusChange?.({ isConfirmed: true, isPaid: false });
        setWalletState({ isLoading: false, error: null });
      }
    } catch (err) {
      setWalletState({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to load wallet. Please try again.",
      });
    }
  };

  const isButtonDisabled =
    walletState.isLoading ||
    isProcessingPayment ||
    txState.status === "pending" ||
    txState.status === "confirmed";

  const buttonLabel = () => {
    if (walletState.isLoading)
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          Connecting…
        </>
      );

    if (isProcessingPayment)
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          Processing Payment...
        </>
      );

    if (txState.status === "pending")
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          Confirming…
        </>
      );

    if (txState.status === "confirmed")
      return (
        <>
          <CheckCircle2 size={20} />
          Ticket Confirmed
        </>
      );

    if (hasPaymentFailed)
      return (
        <>
          <PasswordProtectedShield />
          Retry Payment
        </>
      );

    return (
      <>
        <PasswordProtectedShield />
        {isPaid ? "Connect Wallet to Purchase" : "Attend Anonymously"}
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
        <fieldset disabled={isSoldOut} className="space-y-10 min-w-0 border-0 p-0 m-0">
          <div>
            {ticketTypes.map((ticket, index) => {
              const isSelected = selectedTicket === ticket.name;
              return (
                <div
                  key={ticket.name + index}
                  className="space-y-3 mb-6 last:mb-0"
                >
                  <label
                    htmlFor={ticket.name}
                    className={`${isSoldOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"} flex px-6 py-4 border rounded-xl justify-between items-center transition-colors ease-in-out duration-300 ${isSelected ? "border-[#6917AF]" : "border-[#E4E5E6]"}`}
                  >
                    <p
                      className={`font-semibold text-base transition-colors ease-in-out duration-300 ${isSelected ? "text-[#6917AF]" : ""}`}
                    >
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
          <div className="flex gap-6 flex-col">
            <label htmlFor="" className="text-[#7D7D7D] font-medium">
              Quantity
            </label>
            <div className="flex justify-between lg:items-center gap-6 flex-col lg:flex-row">
              <div className="flex py-5 px-6.5 bg-[#F9FAFB] border border-[#F0F2F5] dark:bg-[#121212] dark:border-[#191919] rounded-4xl w-fit gap-10 justify-between max-w-[12.8rem] min-w-[12.8rem]">
                <button
                  disabled={clampedQuantity === 1}
                  type="button"
                  onClick={decrementQuantity}
                  className={`${clampedQuantity === 1
                    ? "text-[#667185] cursor-not-allowed"
                    : "text-[#6917AF] dark:text-[#6917AF] cursor-pointer"
                    }`}
                >
                  <MinusIcon />
                </button>
                <p className="text-xl font-semibold text-[#6917AF] dark:text-[#6917AF]">
                  {clampedQuantity}
                </p>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={isSoldOut || clampedQuantity === liveSlotsLeft}
                  className={`${isSoldOut || clampedQuantity === liveSlotsLeft
                    ? "text-[#667185] dark:text-[#667185] cursor-not-allowed"
                    : "text-[#6917AF] dark:text-[#6917AF] cursor-pointer"
                    }`}
                >
                  <PlusIcon />
                </button>
              </div>
              <div>
                {isSoldOut ? (
                  <p className="text-[#B42318] dark:text-[#F97066] text-sm font-semibold" role="status">
                    This event is sold out.
                  </p>
                ) : (
                  <p className="text-[#667185] text-sm font-normal" aria-live="polite">
                    Only{" "}
                    <span className="font-semibold dark:text-[#6917AF] text-[#6917AF]">
                      {liveSlotsLeft} Slots
                    </span>{" "}
                    left!
                  </p>
                )}
                <p className="text-sm text-[#667185]">{isSoldOut ? "Check back for other dates." : "Don't miss it"}</p>
              </div>
            </div>
          </div>
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

          {/* Tx banner */}
          <TxBanner txState={txState} />

          {/* Payment error */}
          {hasPaymentFailed && (
            <div className="bg-[#FFF2F2] border border-[#FBCACA] text-[#B42318] py-3 px-5 rounded-lg">
              <p className="text-xs font-medium">
                {paymentError ?? "Payment failed. Please retry."}
              </p>
            </div>
          )}

          <div className="bg-[#F2FFF2] dark:bg-[#131313] dark:text-[#0BD330] text-[#0ABA2A] py-3 px-5 gap-4 flex">
            <DangerIcon />
            <p className="text-xs font-medium">Secure & Instant Payment</p>
          </div>

          <div>
            <button
              type="button"
              disabled={isSoldOut || isProcessingPayment || walletState.isLoading || isButtonDisabled}
              onClick={handlePrimaryClick}
              onMouseEnter={isSoldOut ? undefined : preloadWalletSDK}
              onFocus={isSoldOut ? undefined : preloadWalletSDK}
              className={
                isSoldOut
                  ? "py-4 px-6 flex w-full items-center justify-center font-bold rounded-full gap-3 duration-200 ease-in-out transition bg-[#E4E5E6] text-[#98A2B3] cursor-not-allowed dark:bg-[#232323] dark:text-[#667085]"
                  : `py-4 px-6 bg-[#6917AF] text-[#FCFDFD] flex w-full items-center justify-center font-bold rounded-full gap-3 duration-200 ease-in-out transition dark:bg-[#751AC6] dark:text-[#0F0F0F] dark:hover:bg-[#751AC6]/95 disabled:opacity-60 disabled:cursor-not-allowed ${!(isProcessingPayment || walletState.isLoading)
                    ? "cursor-pointer hover:bg-[#6917AF]/95"
                    : ""
                    }`
              }
            >
              {isSoldOut ? (
                <>
                  <PasswordProtectedShield />
                  <span>Sold out</span>
                </>
              ) : (
                <>{buttonLabel()}</>
              )}
            </button>
            {walletState.error && (
              <p className="mt-2 text-sm text-red-500">{walletState.error}</p>
            )}
            {txState.status === "failed" && (
              <button
                type="button"
                onClick={() =>
                  setTxState({ status: "idle", txHash: null, error: null, attempts: 0 })
                }
                className="text-sm underline mt-2"
              >
                Try again
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </div>
  );
};