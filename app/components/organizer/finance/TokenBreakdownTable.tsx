"use client";

import React from "react";
import { Wallet } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, toBigInt, type TokenSettlement } from "@/lib/organizer/finance";

interface TokenBreakdownTableProps {
  tokens: TokenSettlement[];
}

/** Shortens a `C…` contract address for display without hiding both ends. */
function truncateAddress(address: string): string {
  return address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

/**
 * Per-token escrow position. The contract settles each token separately, so
 * this is the only place the exact payable balances are shown — the headline
 * cards above aggregate them.
 */
export function TokenBreakdownTable({ tokens }: TokenBreakdownTableProps) {
  return (
    <section className="rounded-xl border border-[#E3E3E3] bg-white dark:border-[#2A2A2A] dark:bg-[#141414]">
      <header className="flex items-center gap-2 border-b border-[#EAECF0] p-4 dark:border-[#2A2A2A]">
        <div className="flex size-8 items-center justify-center rounded-full bg-[#F2F4F7] dark:bg-[#1C1C1C]">
          <Wallet className="size-4 text-[#667085]" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-medium text-[#1D2939] dark:text-white">
            Escrow by token
          </h2>
          <p className="text-xs text-[#667085] dark:text-[#808080]">
            Each token settles separately on the event contract.
          </p>
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Platform fee</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">Withdrawable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.length === 0 ? (
            <TableEmpty
              colSpan={5}
              message="No escrow balance yet"
              description="Token balances appear here once this event takes its first paid ticket."
            />
          ) : (
            tokens.map((token) => {
              const releasable = toBigInt(token.withdrawable) > 0n;
              return (
                <TableRow key={token.tokenAddress}>
                  <TableCell>
                    <span className="font-medium text-[#101828] dark:text-white">{token.code}</span>
                    <span
                      className="ml-2 font-mono text-xs text-[#667085]"
                      title={token.tokenAddress}
                    >
                      {truncateAddress(token.tokenAddress)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(token.gross, token.decimals, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#B42318]">
                    −{formatAmount(token.platformFee, token.decimals, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(token.net, token.decimals, 2)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums font-medium ${
                      releasable ? "text-[#027A48]" : "text-[#667085]"
                    }`}
                  >
                    {formatAmount(token.withdrawable, token.decimals, 2)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </section>
  );
}
