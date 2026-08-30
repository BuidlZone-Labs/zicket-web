"use client";

import React, { useState } from "react";
import { CalendarClock, CalendarCheck, Loader2, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionStatusBanner } from "@/components/TransactionStatusBanner";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useUserSessionSync } from "@/lib/user-session-sync";
import {
  describeLedgerWindow,
  hoursToLedgers,
  ledgersRemaining,
  type EventFinance,
} from "@/lib/organizer/finance";

interface PostponementCardProps {
  finance: EventFinance;
  /** Adopts the snapshot the postponement API returns. */
  onUpdated: (finance: EventFinance) => void;
}

/** Refund-choice window presets, in hours. */
const WINDOW_OPTIONS = [
  { value: "24", label: "24 hours" },
  { value: "48", label: "48 hours" },
  { value: "72", label: "72 hours (recommended)" },
  { value: "168", label: "7 days" },
] as const;

type PendingAction = "initiate" | "extend_window" | "finalize";

/**
 * Postponement controls: open the refund-choice window, push its deadline out,
 * and commit the rescheduled start date.
 *
 * Every action is a contract call first and an API write second — the ledger
 * deadline the backend records is the one the signed transaction carries, so
 * the two can't drift. The API write only runs after the chain confirms.
 */
export function PostponementCard({ finance, onUpdated }: PostponementCardProps) {
  const [windowHours, setWindowHours] = useState("72");
  const [newStart, setNewStart] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setWalletConnected } = useUserSessionSync();
  const { publicKey, connect, postponeEvent, setRefundChoiceDeadline, finalizeEventStart } =
    useStellarWallet();

  const { postponement, settlement, contractId } = finance;
  const remaining = ledgersRemaining(postponement);
  const windowOpen = postponement.status === "pending_refund_window" && remaining > 0;

  /** Persists a confirmed postponement transaction and adopts the new snapshot. */
  const commit = async (body: Record<string, unknown>) => {
    const res = await fetch(
      `/api/organizer/events/${encodeURIComponent(finance.eventId)}/postponement`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const payload = (await res.json().catch(() => null)) as
      | { finance?: EventFinance; error?: string }
      | null;
    if (!res.ok || !payload?.finance) {
      throw new Error(payload?.error ?? `Couldn't save the postponement (HTTP ${res.status}).`);
    }
    onUpdated(payload.finance);
  };

  const { status: chainStatus, txHash, error: chainError, startTracking, reset } =
    useTransactionStatus();

  const locked = Boolean(settlement) || finance.status === "cancelled" || !contractId;

  const lockedReason = settlement
    ? "This event has already been settled — its postponement window is closed."
    : finance.status === "cancelled"
      ? "This event was cancelled. Attendees are being refunded in full."
      : !contractId
        ? "Publish this event to deploy its contract before scheduling a postponement."
        : null;

  /**
   * Signs the matching contract call, waits for it to land, then records it.
   * Confirmation is awaited inline rather than through the banner's callback so
   * the API write can't run against a transaction that later fails.
   */
  const run = async (action: PendingAction) => {
    if (locked || pending || !contractId) return;

    setError(null);
    reset();
    setPending(action);

    try {
      const snapshot = publicKey ? undefined : await connect("freighter");
      if (snapshot) setWalletConnected(true);

      const common = { contractId, eventId: finance.eventId, wallet: snapshot };

      if (action === "finalize") {
        const parsed = Date.parse(newStart);
        if (Number.isNaN(parsed)) throw new Error("Pick a new start date and time first.");
        if (parsed <= Date.now()) throw new Error("The new start date must be in the future.");

        const hash = await finalizeEventStart({
          ...common,
          startsAtUnixSeconds: Math.floor(parsed / 1000),
        });
        startTracking(hash);
        await commit({ action: "finalize", rescheduledStartsAt: new Date(parsed).toISOString() });
      } else {
        const hours = Number(windowHours);
        const deadline = postponement.currentLedger + hoursToLedgers(hours);

        const hash =
          action === "initiate"
            ? await postponeEvent({ ...common, refundChoiceDeadlineLedger: deadline })
            : await setRefundChoiceDeadline({ ...common, refundChoiceDeadlineLedger: deadline });
        startTracking(hash);
        await commit({ action, refundWindowHours: hours });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't submit the postponement. Please try again."
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="rounded-xl border border-[#E3E3E3] bg-white dark:border-[#2A2A2A] dark:bg-[#141414]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAECF0] p-4 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#F2F4F7] dark:bg-[#1C1C1C]">
            <CalendarClock className="size-4 text-[#667085]" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#1D2939] dark:text-white">
              Postponement management
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#808080]">
              Opening a refund window holds the escrow until attendees have chosen.
            </p>
          </div>
        </div>

        <Badge variant={windowOpen ? "draft" : postponement.status === "rescheduled" ? "verified" : "muted"}>
          {windowOpen
            ? "Refund window open"
            : postponement.status === "rescheduled"
              ? "Rescheduled"
              : "Not postponed"}
        </Badge>
      </header>

      <div className="space-y-5 p-4">
        <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
          <div>
            <dt className="text-[#667085] dark:text-[#808080]">Original start</dt>
            <dd className="mt-1 font-medium text-[#101828] dark:text-white">
              <time dateTime={postponement.originalStartsAt}>
                {new Date(postponement.originalStartsAt).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-[#667085] dark:text-[#808080]">New start</dt>
            <dd className="mt-1 font-medium text-[#101828] dark:text-white">
              {postponement.rescheduledStartsAt ? (
                <time dateTime={postponement.rescheduledStartsAt}>
                  {new Date(postponement.rescheduledStartsAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </time>
              ) : (
                <span className="text-[#667085]">Not set</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[#667085] dark:text-[#808080]">Refund deadline</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#101828] dark:text-white">
              {postponement.refundChoiceDeadlineLedger ? (
                <>
                  Ledger {postponement.refundChoiceDeadlineLedger.toLocaleString("en-US")}
                  <span className="ml-1 text-xs font-normal text-[#667085]">
                    ({describeLedgerWindow(remaining)})
                  </span>
                </>
              ) : (
                <span className="text-[#667085]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[#667085] dark:text-[#808080]">Refunds claimed</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#101828] dark:text-white">
              {postponement.refundsClaimed.toLocaleString("en-US")}
            </dd>
          </div>
        </dl>

        {lockedReason ? (
          <p className="flex items-start gap-2 rounded-lg border border-[#EAECF0] bg-[#F9FAFB] p-3 text-sm text-[#475467] dark:border-[#2A2A2A] dark:bg-[#1C1C1C] dark:text-[#D0D0D0]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#667085]" aria-hidden />
            {lockedReason}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-[#EAECF0] p-4 dark:border-[#2A2A2A]">
            <Label htmlFor="refund-window">Refund choice window</Label>
            <p className="text-xs text-[#667085] dark:text-[#808080]">
              How long attendees get to claim a refund before the escrow unlocks. Recorded on-chain
              as a deadline ledger.
            </p>
            <Select value={windowHours} onValueChange={setWindowHours} disabled={locked}>
              <SelectTrigger id="refund-window" className="w-full">
                <SelectValue placeholder="Select a window" />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              data-testid={windowOpen ? "extend-refund-window" : "initiate-postponement"}
              className="mt-2 w-full gap-2 rounded-full"
              disabled={locked || pending !== null}
              onClick={() => run(windowOpen ? "extend_window" : "initiate")}
            >
              {pending === "initiate" || pending === "extend_window" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CalendarClock className="size-4" aria-hidden />
              )}
              {windowOpen ? "Extend refund window" : "Initiate postponement"}
            </Button>
          </div>

          <div className="space-y-2 rounded-lg border border-[#EAECF0] p-4 dark:border-[#2A2A2A]">
            <Label htmlFor="new-start">New event start</Label>
            <p className="text-xs text-[#667085] dark:text-[#808080]">
              Commits the rescheduled start on the contract and closes out the postponement.
            </p>
            <Input
              id="new-start"
              type="datetime-local"
              value={newStart}
              disabled={locked}
              onChange={(event) => setNewStart(event.target.value)}
            />
            <Button
              type="button"
              variant="gradient"
              data-testid="finalize-event-date"
              className="mt-2 w-full gap-2 rounded-full"
              disabled={locked || pending !== null || !newStart}
              onClick={() => run("finalize")}
            >
              {pending === "finalize" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CalendarCheck className="size-4" aria-hidden />
              )}
              Finalize event date
            </Button>
          </div>
        </div>

        <TransactionStatusBanner
          status={error ? "wallet_error" : chainStatus}
          txHash={txHash}
          error={error ?? chainError}
          pendingMessage="Recording the postponement on-chain…"
          confirmedMessage="Postponement recorded."
          onRetry={() => {
            reset();
            setError(null);
          }}
        />
      </div>
    </section>
  );
}
