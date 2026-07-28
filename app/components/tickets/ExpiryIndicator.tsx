"use client";

import { useEffect, useState } from "react";
import { Clock, ScanLine, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCountdown,
  formatEventDate,
  formatEventTime,
  getTicketState,
} from "@/lib/tickets";
import type { PurchasedTicket } from "@/lib/dummyEvents/tickets";

/**
 * Event-time / expiry UX for a ticket. Client-only so the live countdown ticks
 * against the real clock; renders a stable placeholder until mounted to avoid a
 * hydration mismatch on the time-sensitive text.
 */
export function ExpiryIndicator({ ticket }: { ticket: PurchasedTicket }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Pre-hydration placeholder — keeps SSR and first client render identical.
  if (now === null) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#E9E9E9] dark:border-[#232323] px-4 py-3 text-sm text-[#667185]">
        <Clock aria-hidden="true" className="size-4 shrink-0" />
        <span>Checking ticket validity…</span>
      </div>
    );
  }

  const state = getTicketState(ticket, now);

  if (state === "upcoming") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-[#D4ADFC] dark:border-[#4A1F7A] bg-[#F5EEFF] dark:bg-[#1C0F2E] px-4 py-3"
      >
        <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6917AF] dark:text-[#D7B5F5]" />
        <div>
          <p className="text-sm font-semibold text-[#6917AF] dark:text-[#D7B5F5]">
            Doors open in {formatCountdown(ticket.eventStart, now)}
          </p>
          <p className="text-xs text-[#6917AF]/80 dark:text-[#D7B5F5]/80">
            {formatEventDate(ticket.eventStart)} · {formatEventTime(ticket.eventStart)} — your QR activates at entry time.
          </p>
        </div>
      </div>
    );
  }

  if (state === "live") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-[#6CE9A6] dark:border-[#166534] bg-[#ECFDF3] dark:bg-[#052E16] px-4 py-3"
      >
        <ScanLine aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#027A48] dark:text-[#4ADE80]" />
        <div>
          <p className="text-sm font-semibold text-[#027A48] dark:text-[#4ADE80]">
            Valid now — show this QR at entry
          </p>
          <p className="text-xs text-[#027A48]/80 dark:text-[#4ADE80]/80">
            Entry closes in {formatCountdown(ticket.eventEnd, now)}.
          </p>
        </div>
      </div>
    );
  }

  if (state === "used") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-[#E9E9E9] dark:border-[#232323] bg-[#F9FAFB] dark:bg-[#121212] px-4 py-3"
      >
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#475467] dark:text-[#D0D0D0]" />
        <div>
          <p className="text-sm font-semibold text-[#344054] dark:text-[#D0D0D0]">
            Checked in{ticket.checkedInAt ? ` · ${formatEventDate(ticket.checkedInAt)}` : ""}
          </p>
          <p className="text-xs text-[#667185]">
            This ticket has already been used for entry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[#FDA29B] dark:border-[#7F1D1D] bg-[#FEF3F2] dark:bg-[#2D0B09] px-4 py-3",
      )}
    >
      <XCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#B42318] dark:text-[#F87171]" />
      <div>
        <p className="text-sm font-semibold text-[#B42318] dark:text-[#F87171]">
          Expired
        </p>
        <p className="text-xs text-[#B42318]/80 dark:text-[#F87171]/80">
          The entry window closed on {formatEventDate(ticket.eventEnd)}.
        </p>
      </div>
    </div>
  );
}
