"use client";

import React from "react";
import { Coins, Landmark, PiggyBank, Receipt } from "lucide-react";

import { AppTooltip } from "@/components/ui/app-tooltip";
import {
  formatAmount,
  formatTokenAmount,
  summarizeTokens,
  type EventFinance,
  type TokenSettlement,
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

  // An event can sell tiers in more than one asset, and the contract settles
  // each separately. Adding USDC to XLM would produce a number that is not an
  // amount of anything, so a mixed escrow reports each token on its own line
  // instead of a single headline figure.
  const isMixed = totals.isMixedAsset;

  const cards: Array<{
    key: string;
    label: string;
    field: keyof Pick<TokenSettlement, "gross" | "platformFee" | "net" | "withdrawable">;
    total: bigint;
    icon: typeof Coins;
    hint: string;
    emphasis: boolean;
  }> = [
    {
      key: "gross",
      label: "Gross revenue",
      field: "gross",
      total: totals.gross,
      icon: Coins,
      hint: "Everything attendees paid into the event escrow, before fees.",
      emphasis: false,
    },
    {
      key: "fee",
      label: `Platform fee (${feePercent}%)`,
      field: "platformFee",
      total: totals.platformFee,
      icon: Receipt,
      hint: `Zicket's ${finance.platformFeeBps} bps cut, deducted by the contract at settlement.`,
      emphasis: false,
    },
    {
      key: "net",
      label: "Net to organizer",
      field: "net",
      total: totals.net,
      icon: PiggyBank,
      hint: "Gross revenue minus the platform fee — your total entitlement for this event.",
      emphasis: false,
    },
    {
      key: "withdrawable",
      label: "Available to withdraw",
      field: "withdrawable",
      total: totals.withdrawable,
      icon: Landmark,
      hint: "The portion of your net revenue the contract will release right now.",
      emphasis: true,
    },
  ];

  /** One line per token for a mixed escrow, one aggregate line otherwise. */
  const linesFor = (card: (typeof cards)[number]): string[] =>
    isMixed
      ? finance.tokens.map((token) =>
          formatTokenAmount(token[card.field], token.decimals, token.code)
        )
      : [`${formatAmount(card.total, decimals, 2)} ${code}`];

  return (
    <section
      aria-label="Escrow summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const { key, label, icon: Icon, hint, emphasis } = card;
        const lines = linesFor(card);

        return (
          <AppTooltip key={key} label={hint} side="bottom">
            <article
              tabIndex={0}
              aria-label={`${label}: ${lines.join(", ")}`}
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

              <div className="mt-3 space-y-0.5">
                {lines.map((line) => (
                  <p
                    key={line}
                    className={`font-semibold tabular-nums ${isMixed ? "text-lg" : "text-2xl"} ${
                      emphasis
                        ? "text-[#6917AF] dark:text-[#D7B5F5]"
                        : "text-[#101828] dark:text-white"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </article>
          </AppTooltip>
        );
      })}

      {isMixed ? (
        <p className="col-span-full text-xs text-[#667085] dark:text-[#808080]">
          This event settled in more than one token. Each is shown separately — they are never
          added together. See the token breakdown for exact balances.
        </p>
      ) : null}
    </section>
  );
}
