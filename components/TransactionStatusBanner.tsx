"use client"

import React from "react"
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  WifiOff,
  Wallet,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransactionStatus } from "@/hooks/useTransactionStatus"
import Link from "next/link";

/**
 * Extends the on-chain polling states from useTransactionStatus with two
 * states that live above it: "reconciling" (on-chain confirmed, backend
 * finalization still in flight) and "reconcile_failed" (on-chain confirmed,
 * backend rejected/errored — funds already moved, don't double-pay) and
 * "wallet_error" (wallet connect/signing failed before any tx exists).
 */
export type BannerStatus = TransactionStatus | "reconciling" | "reconcile_failed" | "wallet_error"

export interface TransactionStatusBannerProps {
  status: BannerStatus
  txHash?: string | null
  error?: string | null
  pendingMessage?: string
  confirmedMessage?: string
  failedMessage?: string
  /** Overrides the default reassurance/caution line shown under the message. */
  hint?: string
  /** Label for the primary retry action. Defaults to a status-appropriate label. */
  retryLabel?: string
  onRetry?: () => void
  /** Shown alongside onRetry for "stalled" — a lighter-weight re-check action. */
  onCheckConnection?: () => void
  explorerBaseUrl?: string
  explorerLabel?: string
  className?: string
}

const CONFIG = {
  idle: null,
  pending: {
    icon: Loader2,
    iconClass: "animate-spin text-[#6917AF]",
    wrapperClass:
      "bg-[#F5EEFF] dark:bg-[#1C0F2E] border-[#D4ADFC] dark:border-[#4A1F7A]",
    textClass: "text-[#6917AF] dark:text-[#D7B5F5]",
    heading: "Transaction Pending",
    role: "status" as const,
    hint: "Safe to retry — no funds have moved yet.",
  },
  stalled: {
    icon: WifiOff,
    iconClass: "text-amber-600 dark:text-amber-400",
    wrapperClass:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    textClass: "text-amber-800 dark:text-amber-300",
    heading: "Network Issue Detected",
    role: "alert" as const,
    hint: "Safe to retry — no assets have been deducted. You can keep waiting or check your connection.",
  },
  confirmed: {
    icon: CheckCircle2,
    iconClass: "text-[#039855]",
    wrapperClass:
      "bg-[#ECFDF3] dark:bg-[#052E16] border-[#6CE9A6] dark:border-[#166534]",
    textClass: "text-[#027A48] dark:text-[#4ADE80]",
    heading: "Transaction Confirmed",
    role: "status" as const,
    hint: undefined,
  },
  reconciling: {
    icon: Loader2,
    iconClass: "animate-spin text-blue-600 dark:text-blue-400",
    wrapperClass:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    textClass: "text-blue-700 dark:text-blue-300",
    heading: "Finalizing Your Ticket",
    role: "status" as const,
    hint: "Your payment is confirmed on-chain. Please don't submit another payment while we finalize your ticket.",
  },
  failed: {
    icon: XCircle,
    iconClass: "text-[#D92D20]",
    wrapperClass:
      "bg-[#FEF3F2] dark:bg-[#2D0B09] border-[#FDA29B] dark:border-[#7F1D1D]",
    textClass: "text-[#B42318] dark:text-[#F87171]",
    heading: "Transaction Failed",
    role: "alert" as const,
    hint: "Safe to retry — no funds were deducted from this attempt.",
  },
  reconcile_failed: {
    icon: XCircle,
    iconClass: "text-[#D92D20]",
    wrapperClass:
      "bg-[#FEF3F2] dark:bg-[#2D0B09] border-[#FDA29B] dark:border-[#7F1D1D]",
    textClass: "text-[#B42318] dark:text-[#F87171]",
    heading: "Confirmation Failed",
    role: "alert" as const,
    hint: "Don't submit another payment — retrying just re-checks your existing one.",
  },
  wallet_error: {
    icon: Wallet,
    iconClass: "text-[#D92D20]",
    wrapperClass:
      "bg-[#FEF3F2] dark:bg-[#2D0B09] border-[#FDA29B] dark:border-[#7F1D1D]",
    textClass: "text-[#B42318] dark:text-[#F87171]",
    heading: "Wallet Error",
    role: "alert" as const,
    hint: "Check your wallet before retrying — avoid approving another payment if one is already pending there.",
  },
} as const

const DEFAULT_MESSAGES: Partial<Record<BannerStatus, string>> = {
  stalled: "The transaction status is currently unknown due to a connection problem. It usually resolves on its own.",
  reconciling: "Payment confirmed on-chain. Finalizing your ticket…",
  reconcile_failed: "Your payment was confirmed on-chain, but we couldn't finalize your ticket.",
  wallet_error: "Failed to load wallet. Please try again.",
}

// Allows non-production environments (e.g. testnet) to point at the right
// explorer without every call site having to pass explorerBaseUrl.
const DEFAULT_EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ?? "https://stellar.expert/explorer/public/tx"
const DEFAULT_EXPLORER_LABEL = "View on Stellar Expert"

export function TransactionStatusBanner({
  status,
  txHash,
  error,
  pendingMessage = "Confirming your ticket purchase…",
  confirmedMessage = "Ticket confirmed! You're all set.",
  failedMessage,
  hint,
  retryLabel,
  onRetry,
  onCheckConnection,
  explorerBaseUrl = DEFAULT_EXPLORER_BASE_URL,
  explorerLabel = DEFAULT_EXPLORER_LABEL,
  className,
}: TransactionStatusBannerProps) {
  const config = CONFIG[status]
  const Icon = config?.icon
  const role = config?.role ?? "status"

  const message =
    status === "pending"
      ? pendingMessage
      : status === "confirmed"
      ? confirmedMessage
      : (failedMessage ?? error ?? DEFAULT_MESSAGES[status] ?? "Something went wrong. Please try again.")

  const hintText = hint ?? config?.hint

  const showExplorerLink = txHash && status !== "pending" && status !== "wallet_error"
  const showHashPreview = txHash && status === "pending"
  const showCheckConnection = status === "stalled" && onCheckConnection
  const showRetry = (status === "failed" || status === "reconcile_failed" || status === "wallet_error") && onRetry
  const showStalledRetryFallback = status === "stalled" && !onCheckConnection && onRetry

  return (
    // The live-region wrapper is always mounted (even for "idle", when it's
    // empty and visually collapses to nothing) so screen readers are already
    // observing it before the first status text appears — a freshly-inserted
    // role="status"/"alert" element can have its initial announcement missed.
    <div
      role={role}
      aria-live={role === "status" ? "polite" : undefined}
      className={cn(
        "flex items-start gap-3 transition-all duration-300",
        config && "rounded-xl border px-4 py-3",
        config?.wrapperClass,
        className
      )}
    >
      {config && Icon && (
        <>
          {/* Icon */}
          <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", config.iconClass)} />

          {/* Body */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className={cn("text-sm font-semibold", config.textClass)}>
                {config.heading}
              </p>
            </div>

            <p className={cn("text-xs leading-relaxed", config.textClass, "opacity-90")}>
              {message}
            </p>

            {/* Explorer link — shown when we have a hash */}
            {showExplorerLink && txHash && (
              <Link
                href={`${explorerBaseUrl}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 text-xs underline underline-offset-2 mt-1",
                  config.textClass
                )}
              >
                {explorerLabel} ↗
              </Link>
            )}

            {/* Shortened hash shown while pending */}
            {showHashPreview && txHash && (
              <p className={cn("text-xs font-mono opacity-60 truncate", config.textClass)}>
                {txHash.slice(0, 12)}…{txHash.slice(-8)}
              </p>
            )}

            {/* Reassurance / caution hint, mirroring the design's "Safe to retry" note */}
            {hintText && (
              <div
                className={cn(
                  "mt-2 flex items-start gap-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] leading-relaxed",
                  config.textClass,
                  "opacity-90"
                )}
              >
                <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0 mt-0.5" />
                <span>{hintText}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              {showCheckConnection && (
                <button
                  type="button"
                  onClick={onCheckConnection}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2",
                    config.textClass
                  )}
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Check Connection
                </button>
              )}

              {(showRetry || showStalledRetryFallback) && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2",
                    config.textClass
                  )}
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  {retryLabel ?? "Try again"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export interface TxStatusDotProps {
  status: TransactionStatus
  className?: string
}

export function TxStatusDot({ status, className }: TxStatusDotProps) {
  if (status === "idle") return null

  const dotClass = {
    pending: "bg-[#6917AF] animate-pulse",
    stalled: "bg-amber-500 animate-pulse",
    confirmed: "bg-[#039855]",
    failed: "bg-[#D92D20]",
  }[status]

  const label = {
    pending: "Pending",
    stalled: "Connection issue",
    confirmed: "Confirmed",
    failed: "Failed",
  }[status]

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("size-2 rounded-full shrink-0", dotClass)} />
      <span className="text-xs text-[#475467] dark:text-[#D0D0D0]">{label}</span>
    </span>
  )
}
