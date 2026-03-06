"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { KeyIcon, LockIcon } from "@/public/svg/svg";
import type { AttendanceBreakdownRow, AttendanceType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ATTENDANCE_TYPE_CONFIG: Record<
  AttendanceType,
  { label: string; icon: React.ReactNode }
> = {
  "wallet-required": {
    label: "Wallet-Required",
    icon: (
      <span className="text-amber-600 dark:text-amber-500 [&>svg]:size-4 shrink-0">
        <KeyIcon />
      </span>
    ),
  },
  "verified-access": {
    label: "Verified Access",
    icon: (
      <span className="text-blue-600 dark:text-blue-400 [&>svg]:size-4 shrink-0">
        <LockIcon />
      </span>
    ),
  },
  anonymous: {
    label: "Anonymous",
    icon: (
      <ShieldCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" />
    ),
  },
};

interface AttendanceBreakdownTableProps {
  data: AttendanceBreakdownRow[];
  title?: string;
}

export default function AttendanceBreakdownTable({
  data,
  title = "Attendance breakdown",
}: AttendanceBreakdownTableProps) {
  return (
    <section className="max-w-[1200px] m-auto my-4 px-4 lg:px-0">
      <div className="border border-[#E3E3E3] dark:border-[#2A2A2A] rounded-[12px] overflow-hidden">
        {title && (
          <div className="px-4 py-3 border-b border-[#E3E3E3] dark:border-[#2A2A2A]">
            <p className="text-base font-medium text-[#344054] dark:text-[#D0D0D0]">
              {title}
            </p>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#E3E3E3] dark:border-[#2A2A2A]">
              <TableHead className="text-left">Attendance Type</TableHead>
              <TableHead className="text-center">Count</TableHead>
              <TableHead className="text-right">Percentage (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const config = ATTENDANCE_TYPE_CONFIG[row.type];
              return (
                <TableRow key={row.type}>
                  <TableCell className="text-left">
                    <Badge variant="muted" className="gap-1.5 font-medium">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{row.count}</TableCell>
                  <TableCell className="text-right">
                    {row.percentage}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
