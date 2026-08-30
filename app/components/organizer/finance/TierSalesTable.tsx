"use client";

import React from "react";
import { Ticket } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, sumAmounts, type TierSales } from "@/lib/organizer/finance";

interface TierSalesTableProps {
  tiers: TierSales[];
  /** Shown as a subtle "live" pulse while a background refresh is running. */
  isRefreshing?: boolean;
}

/** Live ticket sales per tier, and the gross each tier has contributed. */
export function TierSalesTable({ tiers, isRefreshing = false }: TierSalesTableProps) {
  const totalSold = tiers.reduce((acc, tier) => acc + tier.sold, 0);
  const decimals = tiers[0]?.decimals ?? 7;
  const totalGross = sumAmounts(tiers.map((tier) => tier.gross));

  return (
    <section className="rounded-xl border border-[#E3E3E3] bg-white dark:border-[#2A2A2A] dark:bg-[#141414]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAECF0] p-4 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#F2F4F7] dark:bg-[#1C1C1C]">
            <Ticket className="size-4 text-[#667085]" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#1D2939] dark:text-white">
              Ticket sales by tier
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#808080]">
              {totalSold.toLocaleString("en-US")} tickets sold across {tiers.length}{" "}
              {tiers.length === 1 ? "tier" : "tiers"}
            </p>
          </div>
        </div>

        <span
          className="flex items-center gap-2 rounded-full border border-[#E4E7EC] px-3 py-1 text-xs text-[#344054] dark:border-[#2A2A2A] dark:text-[#D0D0D0]"
          aria-live="polite"
        >
          <span
            className={`size-2 rounded-full bg-[#12B76A] ${isRefreshing ? "animate-pulse" : ""}`}
            aria-hidden
          />
          {isRefreshing ? "Updating…" : "Live"}
        </span>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead className="text-right">Gross</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableEmpty
              colSpan={5}
              message="No ticket tiers yet"
              description="Tier sales appear here once this event has tickets on sale."
            />
          ) : (
            tiers.map((tier) => {
              const remaining = tier.capacity === null ? null : tier.capacity - tier.sold;
              const soldOut = remaining !== null && remaining <= 0;
              return (
                <TableRow key={tier.tierId}>
                  <TableCell className="font-medium text-[#101828] dark:text-white">
                    {tier.name}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatAmount(tier.unitPrice, tier.decimals, 2)}{" "}
                    <span className="text-[#667085]">{tier.tokenCode}</span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {tier.sold.toLocaleString("en-US")}
                    {tier.capacity !== null ? (
                      <span className="text-[#667085]"> / {tier.capacity.toLocaleString("en-US")}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {remaining === null ? (
                      <span className="text-[#667085]">Uncapped</span>
                    ) : soldOut ? (
                      <span className="font-medium text-[#B42318]">Sold out</span>
                    ) : (
                      remaining.toLocaleString("en-US")
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-[#101828] dark:text-white">
                    {formatAmount(tier.gross, tier.decimals, 2)}{" "}
                    <span className="font-normal text-[#667085]">{tier.tokenCode}</span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {tiers.length > 0 ? (
        <footer className="flex items-center justify-between border-t border-[#EAECF0] px-4 py-3 text-sm dark:border-[#2A2A2A]">
          <span className="text-[#667085] dark:text-[#808080]">Total gross</span>
          <span className="font-semibold tabular-nums text-[#101828] dark:text-white">
            {formatAmount(totalGross, decimals, 2)}
          </span>
        </footer>
      ) : null}
    </section>
  );
}
