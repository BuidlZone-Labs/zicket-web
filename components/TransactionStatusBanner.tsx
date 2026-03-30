"use client"

import React from "react"
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransactionStatus } from "@/hooks/useTransactionStatus"
import Link from "next/link";

export interface TransactionStatusBannerProps {
  status: TransactionStatus
  txHash?: string | null
  error?: string | null
  pendingMessage?: string
  confirmedMessage?: string
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
    label: "Pending",
  },
  confirmed: {
    icon: CheckCircle2,
    iconClass: "text-[#039855]",
    wrapperClass:
      "bg-[#ECFDF3] dark:bg-[#052E16] border-[#6CE9A6] dark:border-[#166534]",
    textClass: "text-[#027A48] dark:text-[#4ADE80]",
    label: "Confirmed",
  },
  failed: {
    icon: XCircle,
    iconClass: "text-[#D92D20]",
    wrapperClass:
      "bg-[#FEF3F2] dark:bg-[#2D0B09] border-[#FDA29B] dark:border-[#7F1D1D]",
    textClass: "text-[#B42318] dark:text-[#F87171]",
    label: "Failed",
  },
} as const

function explorerUrl(txHash: string) {
  return `https://solscan.io/tx/${txHash}`
}

export function TransactionStatusBanner({
  status,
  txHash,
  error,
  pendingMessage = "Confirming your ticket purchase…",
  confirmedMessage = "Ticket confirmed! You're all set.",
  className,
}: TransactionStatusBannerProps) {
  const config = CONFIG[status]
  if (!config) return null

  const Icon = config.icon

  const message =
    status === "pending"
      ? pendingMessage
      : status === "confirmed"
      ? confirmedMessage
      : (error ?? "Something went wrong. Please try again.")

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
        config.wrapperClass,
        className
      )}
    >
      {/* Icon */}
      <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconClass)} />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-semibold", config.textClass)}>
            Transaction {config.label}
          </p>
        </div>

        <p className={cn("text-xs leading-relaxed", config.textClass, "opacity-90")}>
          {message}
        </p>

        {/* Explorer link — shown when we have a hash */}
        {txHash && status !== "pending" && (
          <Link
            href={explorerUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 text-xs underline underline-offset-2 mt-1",
              config.textClass
            )}
          >
            View on Solscan ↗
          </Link>
        )}

        {/* Shortened hash shown while pending */}
        {txHash && status === "pending" && (
          <p className={cn("text-xs font-mono opacity-60 truncate", config.textClass)}>
            {txHash.slice(0, 12)}…{txHash.slice(-8)}
          </p>
        )}
      </div>
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
    confirmed: "bg-[#039855]",
    failed: "bg-[#D92D20]",
  }[status]

  const label = {
    pending: "Pending",
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