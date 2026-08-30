"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostponementCard } from "@/app/components/organizer/finance/PostponementCard";
import { SettlementSummary } from "@/app/components/organizer/finance/SettlementSummary";
import { TierSalesTable } from "@/app/components/organizer/finance/TierSalesTable";
import { TokenBreakdownTable } from "@/app/components/organizer/finance/TokenBreakdownTable";
import { WithdrawRevenueCard } from "@/app/components/organizer/finance/WithdrawRevenueCard";
import { useEventFinance } from "@/hooks/useEventFinance";
import { ESCROW_STATUS_LABEL, type EscrowContractStatus } from "@/lib/organizer/finance";

/** Badge tone per contract state — green only once escrow is actually payable. */
const STATUS_VARIANT: Record<
  EscrowContractStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  draft: "muted",
  selling: "info",
  locked: "draft",
  postponed: "draft",
  completed: "verified",
  cancelled: "destructive",
};

/**
 * Organizer settlement & financial management dashboard for a single event.
 *
 * Owns the one live settlement snapshot and hands it down; the withdraw and
 * postponement cards push their post-transaction snapshots back up through
 * `applyFinance`, so every card re-renders from the same source after a
 * contract call instead of each holding its own copy.
 */
export default function EventFinancePage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId ?? "";

  const { finance, isLoading, isRefreshing, error, refresh, applyFinance } =
    useEventFinance(eventId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-[#667085]">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        <span>Loading settlement data…</span>
      </div>
    );
  }

  if (error || !finance) {
    return (
      <div className="p-6 lg:p-8">
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] p-6 dark:border-[#7A271A] dark:bg-[#450A0A]"
        >
          <div className="flex items-center gap-2 font-medium text-[#B42318] dark:text-[#FDA29B]">
            <AlertCircle className="size-5" aria-hidden />
            Couldn&apos;t load settlement data
          </div>
          <p className="text-sm text-[#B42318] dark:text-[#FDA29B]">
            {error ?? "This event has no financial record yet."}
          </p>
          <Button variant="outline" className="gap-2 rounded-full" onClick={() => void refresh()}>
            <RefreshCw className="size-4" aria-hidden />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/zkorg/events/${eventId}`}
            className="inline-flex items-center gap-1 text-sm text-[#667085] transition-colors hover:text-[#6917AF]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to event
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-[#101828] sm:text-2xl dark:text-white">
            {finance.eventTitle} — Finance
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#667085] dark:text-[#808080]">
            <Badge variant={STATUS_VARIANT[finance.status]}>
              {ESCROW_STATUS_LABEL[finance.status]}
            </Badge>
            {finance.contractId ? (
              <span className="font-mono text-xs" title={finance.contractId}>
                {finance.contractId.slice(0, 8)}…{finance.contractId.slice(-6)}
              </span>
            ) : (
              <span className="text-xs">No contract deployed</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            disabled={isRefreshing}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
            Refresh
          </Button>
          <p className="text-xs text-[#667085] dark:text-[#808080]">
            As of{" "}
            <time dateTime={finance.refreshedAt}>
              {new Date(finance.refreshedAt).toLocaleTimeString("en-US", { timeStyle: "medium" })}
            </time>
          </p>
        </div>
      </div>

      <SettlementSummary finance={finance} />

      <WithdrawRevenueCard finance={finance} onSettled={applyFinance} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TierSalesTable tiers={finance.tiers} isRefreshing={isRefreshing} />
        <TokenBreakdownTable tokens={finance.tokens} />
      </div>

      <PostponementCard finance={finance} onUpdated={applyFinance} />
    </div>
  );
}
