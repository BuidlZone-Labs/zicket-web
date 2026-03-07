'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManageZkEmailProps {
  eventName?: string;
}

export default function MessagingCenter({ eventName = 'Crypto Art Lagos 2025' }: ManageZkEmailProps) {
  return (
    <div className="border-2 border-[#36B9CC] rounded-lg sm:rounded-xl bg-white overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#F2F4F7] gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#F9FAFB] rounded-lg flex items-center justify-center border border-[#EAECF0] shrink-0">
            <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-[#475467]" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-[#101828]">Manage zkEmail</h2>
        </div>
        <Link href="/zkorg/emails/create" className="w-full sm:w-auto">
          <Button
            variant="default"
            className="h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium bg-[#101828] text-white hover:bg-[#1a1a1a] rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95 w-full sm:w-auto"
          >
            Send New zkEmail
          </Button>
        </Link>
      </div>

      {/* Table Header */}
      <div className="bg-[#F9FAFB] border-b border-[#F2F4F7] overflow-x-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-6 py-3 min-w-full">
          <div className="text-xs font-medium text-[#475467] uppercase tracking-wide">
            Subject
          </div>
          <div className="text-xs font-medium text-[#475467] uppercase tracking-wide hidden sm:block">
            Recipients
          </div>
          <div className="text-xs font-medium text-[#475467] uppercase tracking-wide hidden sm:block">
            Status
          </div>
          <div className="text-xs font-medium text-[#475467] uppercase tracking-wide">
            Date
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex items-center justify-center py-16 sm:py-24">
        <p className="text-[#667085] text-sm sm:text-base">No Data to Show yet...</p>
      </div>
    </div>
  );
}
