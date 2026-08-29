"use client";

import { FC, useState } from "react";
import { Check, Loader2, CheckCircle2, WifiOff } from "lucide-react";
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
import { TicketType, PrivacyLevel } from "@/lib/dummyEvents/events";
import { PrivacyLevelExplanationModal } from "../PrivacyLevelInfo";
import {
  useStellarWallet,
  type StellarWalletId,
  type WalletLoadState,
  type WalletSnapshot,
} from "@/hooks/useStellarWallet";
import { useUserSessionSync } from "@/lib/user-session-sync";
import { useCooldown } from "@/hooks/useCooldown";
import { CooldownMessage } from "@/app/components/AntiSpam/CooldownMessage";
import { TransactionStatusBanner, type BannerStatus } from "@/components/TransactionStatusBanner";
import { useTransactionStatus, type TransactionStatus } from "@/hooks/useTransactionStatus";
import { PrivacyTrustModal } from "@/app/components/privacy/PrivacyTrustModal";
import { getEffectivePrivacyLevel } from "@/lib/privacyTrust";

type PaymentStatus = "idle" | "processing" | "failed";

// Set once the Soroban ticketing contract is deployed and its address is
// known (see the zicket-contract repo). Purchases fail fast with a clear
// error until then, instead of silently signing against a placeholder ID.
const TICKET_CONTRACT_ID = process.env.NEXT_PUBLIC_ZICKET_EVENT_CONTRACT_ID;

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
  onResetPayment?: () => void;
}

/**
 * Single derived status driving the one shared banner, in priority order, so
 * a chain success and a reconcile failure can never render two contradictory
 * messages at once.
 */
function getBannerStatus(params: {
  walletError: string | null;
  chainStatus: TransactionStatus;
  hasPaymentFailed: boolean;
}): BannerStatus {
  const { walletError, chainStatus, hasPaymentFailed } = params;

  if (walletError) return "wallet_error";
  if (chainStatus === "failed") return "failed";
  if (chainStatus === "confirmed" && hasPaymentFailed) return "reconcile_failed";
  // Any on-chain confirmation still in checkout means we're finalizing (or
  // about to). Never show the green "Ticket confirmed!" success here -- that
  // would flash between poll confirm and paymentStatus flipping to
  // "processing", and the real success UI is PurchasedStage.
  if (chainStatus === "confirmed") return "reconciling";
  if (chainStatus === "stalled") return "stalled";
  if (chainStatus === "pending") return "pending";
  // Pre-flight failure (e.g. sold out) -- no tx was ever attempted.
  if (hasPaymentFailed) return "failed";
  return "idle";
}

/**
 * Ticket purchase panel for an event. Drives the paid (wallet + on-chain
 * polling) and free (anonymous) flows, coordinates reconciliation via
 * `onStatusChange`, and renders a single derived {@link TransactionStatusBanner}
 * so wallet, chain, and reconcile states never contradict each other.
 */
export const TicketInfo: FC<TicketInfoProps> = ({
  eventId,
  ticketTypes,
  privacyLevel,
  isPaid,
  paymentStatus = "idle",
  paymentError = null,
  onStatusChange,
  onResetPayment,
}) => {
  const { anonymousBrowsing, walletConnected, setAnonymousBrowsing, setWalletConnected } =
    useUserSessionSync();
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
  // Which Stellar wallet the next purchase attempt connects with -- defaults
  // to Freighter; the "Use Albedo instead" link below switches this for
  // people without the Freighter extension installed.
  const [selectedWallet, setSelectedWallet] = useState<StellarWalletId>("freighter");
  const {
    publicKey: stellarPublicKey,
    connect: connectStellarWallet,
    preload: preloadStellarWallet,
    registerForEvent,
  } = useStellarWallet();

  // Chain-level polling lives in the shared hook; reconciliation (the backend
  // finalize step) is owned by the parent (onStatusChange) and layered on top
  // via paymentStatus/paymentError below -- see `bannerStatus`.
  const {
    status: chainStatus,
    txHash: chainTxHash,
    error: chainError,
    startTracking,
    reset: resetChainTracking,
    checkConnection,
  } = useTransactionStatus({
    onConfirmed: () => {
      void onStatusChange?.({ isConfirmed: true, isPaid });
    },
  });

  const { isOnCooldown, remainingSeconds, startCooldown } = useCooldown({ duration: 8 });

  // Privacy Trust prompt: the purchase button opens this first; the real
  // purchase only runs when the user confirms in the modal.
  const [trustOpen, setTrustOpen] = useState(false);

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

  // Guard, then open the trust prompt instead of buying straight away.
  const handlePrimaryClick = () => {
    if (isProcessingPayment || chainStatus === "pending" || chainStatus === "stalled" || isOnCooldown) return;

    // The on-chain payment already succeeded and only the backend reconcile
    // step failed -- retry reconciliation directly. No new data is shared, so
    // skip the trust prompt and don't re-trigger a new wallet signature (the
    // user could otherwise end up paying twice).
    if (hasPaymentFailed && chainStatus === "confirmed") {
      void onStatusChange?.({ isConfirmed: true, isPaid });
      return;
    }

    if (isSoldOut) return;

    setTrustOpen(true);
  };

  // The actual purchase -- only reached after the user confirms in the modal.
  const runPurchase = async () => {
    setTrustOpen(false);
    // Re-check availability/state first: things can change while the modal is
    // open (e.g. a sell-out), so bail before starting cooldown/loading --
    // otherwise the CTA would stay stuck disabled with no path to clear it.
    if (
      isProcessingPayment ||
      chainStatus === "pending" ||
      chainStatus === "stalled" ||
      isOnCooldown ||
      isSoldOut
    )
      return;

    startCooldown();

    setWalletState({ isLoading: true, error: null });
    resetChainTracking();

    try {
      if (isPaid) {
        if (!TICKET_CONTRACT_ID) {
          throw new Error(
            "Ticket purchases aren't configured yet -- the event contract address is missing."
          );
        }

        // A snapshot is only needed when we just connected in this call --
        // hook state won't have re-rendered yet, so signAndSubmit would read
        // a stale (pre-connect) walletId/publicKey without it. Already-
        // connected users (stellarPublicKey already set) skip this entirely.
        let walletSnapshot: WalletSnapshot | undefined;
        let address: string;
        if (stellarPublicKey) {
          address = stellarPublicKey;
        } else {
          // connectStellarWallet() always resolves with a non-null snapshot
          // on success (it throws instead of resolving on any failure).
          const connected = await connectStellarWallet(selectedWallet);
          walletSnapshot = connected;
          address = connected.publicKey;
        }
        setWalletConnected(true);

        const txHash = await registerForEvent({
          contractId: TICKET_CONTRACT_ID,
          eventId,
          attendee: address,
          wallet: walletSnapshot,
        });
        setWalletState({ isLoading: false, error: null });
        startTracking(txHash);
      } else {
        const result = await onStatusChange?.({ isConfirmed: true, isPaid: false });
        if (result && !result.ok) {
          // Parent owns paymentError / failed banner -- don't pretend anonymous
          // mode succeeded when reconcile rejected the attempt.
          setWalletState({ isLoading: false, error: null });
          return;
        }
        setAnonymousBrowsing(true);
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

  const handleRetry = () => {
    resetChainTracking();
    setWalletState({ isLoading: false, error: null });
    onResetPayment?.();
  };

  const isButtonDisabled =
    walletState.isLoading ||
    isProcessingPayment ||
    chainStatus === "pending" ||
    chainStatus === "stalled" ||
    (chainStatus === "confirmed" && paymentStatus !== "failed") ||
    isOnCooldown;

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

    if (chainStatus === "pending")
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          Confirming…
        </>
      );

    if (chainStatus === "stalled")
      return (
        <>
          <WifiOff size={20} />
          Connection issue…
        </>
      );

    if (chainStatus === "confirmed" && hasPaymentFailed)
      return (
        <>
          <PasswordProtectedShield />
          Retry Confirmation
        </>
      );

    if (chainStatus === "confirmed")
      return (
        <>
          <CheckCircle2 size={20} />
          Ticket Confirmed
        </>
      );

    if (chainStatus === "failed")
      return (
        <>
          <PasswordProtectedShield />
          Retry Payment
        </>
      );

    if (isOnCooldown)
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          Please wait {remainingSeconds}s
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
        {isPaid
          ? walletConnected
            ? "Wallet Connected"
            : "Connect Wallet to Purchase"
          : anonymousBrowsing
            ? "Anonymous Mode Enabled"
            : "Attend Anonymously"}
      </>
    );
  };

  const bannerStatus = getBannerStatus({
    walletError: walletState.error,
    chainStatus,
    hasPaymentFailed,
  });

  const bannerError =
    bannerStatus === "wallet_error"
      ? walletState.error
      : bannerStatus === "reconcile_failed" || (bannerStatus === "failed" && chainStatus === "idle")
        ? paymentError
        : chainError;

  const bannerRetry =
    bannerStatus === "wallet_error"
      ? (isOnCooldown ? undefined : handlePrimaryClick)
      : bannerStatus === "reconcile_failed"
        ? () => void onStatusChange?.({ isConfirmed: true, isPaid })
        : bannerStatus === "failed"
          ? handleRetry
          : undefined;

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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <p className="font-medium text-[#7D7D7D]">Privacy Level:</p>
              <PrivacyLevelExplanationModal privacyLevels={privacyLevel as PrivacyLevel[]} />
            </div>
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
        </fieldset>

        {/* Unified failure/status banner -- covers wallet errors, chain
            delays, stalled connections, on-chain failures, and partial
            (on-chain-ok-but-not-reconciled) confirmations in one place.
            Kept outside the fieldset above: its retry/check-connection
            actions must stay usable even if the event sells out while a
            payment the user already made is still being reconciled. */}
        <TransactionStatusBanner
          status={bannerStatus}
          txHash={chainTxHash}
          error={bannerError}
          retryLabel={bannerStatus === "reconcile_failed" ? "Retry Confirmation" : undefined}
          onRetry={bannerRetry}
          onCheckConnection={bannerStatus === "stalled" ? checkConnection : undefined}
        />

        {/* Cooldown message */}
        <CooldownMessage remainingSeconds={remainingSeconds} />

        <div className="bg-[#F2FFF2] dark:bg-[#131313] dark:text-[#0BD330] text-[#0ABA2A] py-3 px-5 gap-4 flex">
          <DangerIcon />
          <p className="text-xs font-medium">Secure & Instant Payment</p>
        </div>

        <div>
          <button
            type="button"
            disabled={isSoldOut || isProcessingPayment || walletState.isLoading || isButtonDisabled}
            onClick={handlePrimaryClick}
            onMouseEnter={isSoldOut ? undefined : () => preloadStellarWallet("freighter")}
            onFocus={isSoldOut ? undefined : () => preloadStellarWallet("freighter")}
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

          {/* Freighter is the default wallet; offer Albedo (no extension
              required) as a fallback for anyone who doesn't have Freighter
              installed. Only relevant before a wallet is connected. */}
          {isPaid && !stellarPublicKey && !isSoldOut && (
            <button
              type="button"
              onClick={() => setSelectedWallet((w) => (w === "albedo" ? "freighter" : "albedo"))}
              className="mt-2 w-full text-center text-xs text-[#667185] hover:text-[#6917AF] underline-offset-2 hover:underline cursor-pointer"
            >
              {selectedWallet === "albedo"
                ? "Use Freighter instead"
                : "No Freighter? Use Albedo instead"}
            </button>
          )}
        </div>
      </form>

      <PrivacyTrustModal
        isOpen={trustOpen}
        context="payment"
        privacyLevel={getEffectivePrivacyLevel(privacyLevel as PrivacyLevel[])}
        isProcessing={walletState.isLoading}
        onConfirm={runPurchase}
        onClose={() => setTrustOpen(false)}
      />
    </div>
  );
};