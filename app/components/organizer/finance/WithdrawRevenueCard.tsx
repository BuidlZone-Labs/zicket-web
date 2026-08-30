"use client";

import React, { useCallback, useState } from "react";
import { BadgeCheck, Banknote, ExternalLink, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { TransactionStatusBanner } from "@/components/TransactionStatusBanner";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useUserSessionSync } from "@/lib/user-session-sync";
import {
  formatTokenAmount,
  resolveWithdrawGate,
  resolveWithdrawMethod,
  summarizeTokens,
  type EventFinance,
  type WithdrawMethod,
} from "@/lib/organizer/finance";

interface WithdrawRevenueCardProps {
  finance: EventFinance;
  /** Re-reads the settlement snapshot after a withdrawal confirms. */
  onSettled: (finance: EventFinance) => void;
}

const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ?? "https://stellar.expert/explorer/public/tx";

/** Copy for the button itself, so the label always names the entrypoint used. */
const METHOD_LABEL: Record<WithdrawMethod, string> = {
  withdraw_revenue: "Withdraw Revenue",
  withdraw_all_tokens: "Withdraw All Tokens",
};

/**
 * The settlement action: signs `withdraw_revenue` (single token) or
 * `withdraw_all_tokens` (multi-token) with the organizer's connected wallet,
 * tracks the transaction to confirmation, then records the receipt server-side.
 *
 * Whether the button is live — and the explanation when it isn't — comes
 * entirely from `resolveWithdrawGate`, so the button, its tooltip, and the
 * inline explainer can never disagree about why an escrow is unavailable.
 */
export function WithdrawRevenueCard({ finance, onSettled }: WithdrawRevenueCardProps) {
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  const { setWalletConnected } = useUserSessionSync();
  const {
    publicKey,
    connect,
    preload,
    withdrawRevenue,
    withdrawAllTokens,
  } = useStellarWallet();

  const totals = summarizeTokens(finance.tokens);
  const method = resolveWithdrawMethod(finance.tokens);

  /**
   * Persists the receipt once the chain confirms. A failure here is not a lost
   * payout — the funds have already moved — so it surfaces as a "recorded
   * later" notice rather than a failed withdrawal.
   */
  const recordSettlement = useCallback(
    async (txHash: string) => {
      try {
        const res = await fetch(
          `/api/organizer/events/${encodeURIComponent(finance.eventId)}/finance`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ txHash, method, destination: publicKey }),
          }
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? `HTTP ${res.status}`);
        }
        const payload = (await res.json()) as { finance: EventFinance };
        setRecordError(null);
        onSettled(payload.finance);
      } catch (err) {
        setRecordError(
          err instanceof Error
            ? `Your withdrawal confirmed on-chain, but we couldn't save the receipt (${err.message}). It will reconcile automatically.`
            : "Your withdrawal confirmed on-chain, but we couldn't save the receipt. It will reconcile automatically."
        );
      }
    },
    [finance.eventId, method, publicKey, onSettled]
  );

  const {
    status: chainStatus,
    txHash,
    error: chainError,
    startTracking,
    reset: resetTracking,
    checkConnection,
  } = useTransactionStatus({ onConfirmed: recordSettlement });

  // "confirmed" counts as submitting too: the escrow has already paid out, but
  // `finance.settlement` only appears once recordSettlement() lands. Without
  // this the button would re-enable in the window between the two — and stay
  // enabled for good if that write failed — inviting a second withdrawal.
  const isSubmitting =
    isSigning ||
    chainStatus === "pending" ||
    chainStatus === "stalled" ||
    chainStatus === "confirmed";
  const gate = resolveWithdrawGate(finance, { isSubmitting });

  const handleWithdraw = async () => {
    if (!gate.enabled || !finance.contractId) return;

    setWalletError(null);
    setRecordError(null);
    resetTracking();
    setIsSigning(true);

    try {
      // Only needed when we connect inside this click — hook state hasn't
      // re-rendered yet, so the signer would otherwise read as null.
      const snapshot = publicKey ? undefined : await connect("freighter");
      if (snapshot) setWalletConnected(true);

      const common = {
        contractId: finance.contractId,
        eventId: finance.eventId,
        wallet: snapshot,
      };

      // Single-token settlement needs the token address; the gate already
      // guarantees a balance exists, so this is a belt-and-braces check.
      const singleToken = totals.withdrawableTokens[0];
      if (method === "withdraw_revenue" && !singleToken) {
        throw new Error("There's no withdrawable token balance on this event.");
      }

      const hash =
        method === "withdraw_all_tokens"
          ? await withdrawAllTokens(common)
          : await withdrawRevenue({ ...common, tokenAddress: singleToken.tokenAddress });

      setIsSigning(false);
      startTracking(hash);
    } catch (err) {
      setIsSigning(false);
      setWalletError(
        err instanceof Error ? err.message : "Couldn't submit the withdrawal. Please try again."
      );
    }
  };

  const handleRetry = () => {
    resetTracking();
    setWalletError(null);
    setRecordError(null);
  };

  const settlement = finance.settlement;

  const buttonLabel = isSigning
    ? "Awaiting signature…"
    : chainStatus === "pending" || chainStatus === "stalled"
      ? "Settling…"
      : METHOD_LABEL[method];

  const button = (
    <Button
      type="button"
      variant="gradient"
      data-testid="withdraw-revenue-button"
      data-block-reason={gate.code ?? undefined}
      className="h-11 gap-2 rounded-full px-6!"
      disabled={!gate.enabled}
      aria-describedby={gate.reason ? "withdraw-gate-reason" : undefined}
      onMouseEnter={() => preload("freighter")}
      onClick={handleWithdraw}
    >
      {isSubmitting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Banknote className="size-4" aria-hidden />
      )}
      {buttonLabel}
    </Button>
  );

  return (
    <section className="rounded-xl border border-[#E3E3E3] bg-white p-4 dark:border-[#2A2A2A] dark:bg-[#141414]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-[#1D2939] dark:text-white">
            Revenue settlement
          </h2>
          <p className="mt-1 text-sm text-[#667085] dark:text-[#808080]">
            {settlement
              ? "This event's escrow has been settled to your wallet."
              : `Release your escrow balance from the event contract via ${method}().`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <p className="text-xs uppercase tracking-wide text-[#667085]">Available now</p>
          <p className="text-xl font-semibold tabular-nums text-[#101828] dark:text-white">
            {formatTokenAmount(
              totals.withdrawable,
              totals.primary?.decimals ?? 7,
              totals.primary?.code ?? "USDC"
            )}
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Radix tooltips need a live trigger — a disabled button swallows
            pointer events, so the wrapper carries the hover/focus target. */}
        {gate.reason ? (
          <AppTooltip label={gate.reason} side="top">
            <span tabIndex={0} className="inline-flex rounded-full outline-none">
              {button}
            </span>
          </AppTooltip>
        ) : (
          button
        )}

        {gate.reason ? (
          <p
            id="withdraw-gate-reason"
            role="note"
            className="flex max-w-md items-start gap-2 text-sm text-[#667085] dark:text-[#808080]"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-[#667085]" aria-hidden />
            {gate.reason}
          </p>
        ) : null}
      </div>

      <TransactionStatusBanner
        status={walletError ? "wallet_error" : chainStatus}
        txHash={txHash}
        error={walletError ?? chainError}
        pendingMessage="Settling your revenue on-chain…"
        confirmedMessage="Revenue settled to your wallet."
        onRetry={handleRetry}
        onCheckConnection={checkConnection}
        explorerBaseUrl={EXPLORER_BASE_URL}
        className="mt-4"
      />

      {recordError ? (
        <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-400">
          {recordError}
        </p>
      ) : null}

      {settlement ? (
        <dl
          data-testid="settlement-receipt"
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-[#6CE9A6] bg-[#ECFDF3] p-4 text-sm sm:grid-cols-2 dark:border-[#166534] dark:bg-[#052E16]"
        >
          <div className="sm:col-span-2 flex items-center gap-2 font-medium text-[#027A48] dark:text-[#4ADE80]">
            <BadgeCheck className="size-4" aria-hidden />
            Settlement receipt
          </div>

          <div>
            <dt className="text-[#667085] dark:text-[#8FBFA0]">Withdrawn at</dt>
            <dd className="font-medium text-[#101828] dark:text-white">
              <time dateTime={settlement.withdrawnAt}>
                {new Date(settlement.withdrawnAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </dd>
          </div>

          <div>
            <dt className="text-[#667085] dark:text-[#8FBFA0]">Amount settled</dt>
            <dd className="font-medium tabular-nums text-[#101828] dark:text-white">
              {settlement.tokens.length === 0
                ? "—"
                : settlement.tokens
                    .map((t) => formatTokenAmount(t.amount, t.decimals, t.code))
                    .join(" · ")}
            </dd>
          </div>

          <div>
            <dt className="text-[#667085] dark:text-[#8FBFA0]">Contract call</dt>
            <dd className="font-mono text-xs text-[#101828] dark:text-white">
              {settlement.method}()
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-[#667085] dark:text-[#8FBFA0]">Transaction</dt>
            <dd className="truncate">
              <a
                href={`${EXPLORER_BASE_URL}/${settlement.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#6917AF] hover:underline dark:text-[#D7B5F5]"
              >
                {settlement.txHash.slice(0, 10)}…{settlement.txHash.slice(-8)}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
