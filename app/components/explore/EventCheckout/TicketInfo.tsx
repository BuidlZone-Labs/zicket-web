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
  paymentStatus?: PaymentStatus;
  paymentError?: string | null;
  onStatusChange?: (status: {
    isConfirmed: boolean;
    isPaid: boolean;
  }) => Promise<{ ok: boolean; error?: string }> | { ok: boolean; error?: string };
}

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20;

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
          <a
            href={`https://solscan.io/tx/${txState.txHash}`}
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
  ticketTypes,
  slotsLeft,
  privacyLevel,
  isPaid,
  paymentStatus = "idle",
  paymentError = null,
  onStatusChange,
}) => {
  const [selectedTicket, setSelectedTicket] = useState(ticketTypes[0].name);
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
    <div className="p-8 border rounded-xl space-y-6">
      <h2 className="text-xl font-semibold">Ticket Info</h2>

      {/* Payment error */}
      {hasPaymentFailed && (
        <div className="bg-red-100 p-3 text-sm">
          {paymentError ?? "Payment failed. Please retry."}
        </div>
      )}

      {/* Tx banner */}
      <TxBanner txState={txState} />

      {/* Button */}
      <button
        onClick={handlePrimaryClick}
        disabled={isButtonDisabled}
        onMouseEnter={preloadWalletSDK}
        className="w-full py-4 bg-purple-700 text-white rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {buttonLabel()}
      </button>

      {walletState.error && (
        <p className="text-sm text-red-500">{walletState.error}</p>
      )}

      {txState.status === "failed" && (
        <button
          onClick={() =>
            setTxState({ status: "idle", txHash: null, error: null, attempts: 0 })
          }
          className="text-sm underline mt-2"
        >
          Try again
        </button>
      )}
    </div>
  );
};