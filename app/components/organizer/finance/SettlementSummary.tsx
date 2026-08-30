"use client";

import React from "react";
import { Coins, Landmark, PiggyBank, Receipt } from "lucide-react";

import { AppTooltip } from "@/components/ui/app-tooltip";
import {
  formatAmount,
  summarizeTokens,
  type EventFinance,
} from "@/lib/organizer/finance";

interface SettlementSummaryProps {
  finance: EventFinance;
}

/**
 * Headline escrow figures: what came in, what the platform took, what the
 * organizer is owed, and what the contract will release right now.
 *
 * "Available to withdraw" is deliberately shown even when it's zero — an
 * organizer needs to see that the balance is locked, not just that the button
 * is greyed out.
 */
export function SettlementSummary({ finance }: SettlementSummaryProps) {
  const totals = summarizeTokens(finance.tokens);
  const decimals = totals.primary?.decimals ?? 7;
  const code = totals.primary?.code ?? "USDC";
  const feePercent = (finance.platformFeeBps / 100).toFixed(2).replace(/\.?0+$/, "");
  // Amounts are only summed across tokens when they all share a precision;
  // otherwise the headline would be adding unlike units.
  const mixedPrecision = new Set(finance.tokens.map((t) => t.decimals)).size > 1;

  const cards = [
    {
      key: "gross",
      label: "Gross revenue",
      value: totals.gross,
      icon: Coins,
      hint: "Everything attendees paid into the event escrow, before fees.",
      emphasis: false,
    },
    {
      key: "fee",
      label: `Platform fee (${feePercent}%)`,
      value: totals.platformFee,
      icon: Receipt,
      hint: `Zicket's ${finance.platformFeeBps} bps cut, deducted by the contract at settlement.`,
      emphasis: false,
    },
    {
      key: "net",
      label: "Net to organizer",
      value: totals.net,
      icon: PiggyBank,
      hint: "Gross revenue minus the platform fee — your total entitlement for this event.",
      emphasis: false,
    },
    {
      key: "withdrawable",
      label: "Available to withdraw",
      value: totals.withdrawable,
      icon: Landmark,
      hint: "The portion of your net revenue the contract will release right now.",
      emphasis: true,
    },
  ];

  return (
    <section
      aria-label="Escrow summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ key, label, value, icon: Icon, hint, emphasis }) => (
        <AppTooltip key={key} label={hint} side="bottom">
          <article
            tabIndex={0}
            aria-label={`${label}: ${formatAmount(value, decimals, 2)} ${code}`}
            className={`rounded-xl border p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#6917AF]/40 ${
              emphasis
                ? "border-[#6917AF]/40 bg-[#F9F5FF] dark:border-[#6917AF]/50 dark:bg-[#6917AF]/10"
                : "border-[#E3E3E3] bg-white dark:border-[#2A2A2A] dark:bg-[#141414]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={`size-4 ${emphasis ? "text-[#6917AF]" : "text-[#667085]"}`}
                aria-hidden
              />
              <p className="text-sm font-medium text-[#475467] dark:text-[#D0D0D0]">{label}</p>
            </div>
            <p
              className={`mt-3 text-2xl font-semibold tabular-nums ${
                emphasis ? "text-[#6917AF] dark:text-[#D7B5F5]" : "text-[#101828] dark:text-white"
              }`}
            >
              {formatAmount(value, decimals, 2)}
              <span className="ml-1 text-sm font-medium text-[#667085]">{code}</span>
            </p>
          </article>
        </AppTooltip>
      ))}

      {mixedPrecision ? (
        <p className="col-span-full text-xs text-[#667085] dark:text-[#808080]">
          This event settled in tokens with different precision — see the token breakdown below for
          exact per-token balances.
        </p>
      ) : null}
    </section>
  );
}
