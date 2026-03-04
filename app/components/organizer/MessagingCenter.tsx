'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessagingCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'messaging'>('overview');

  return (
    <div className="w-full">
      {/* Event Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-white border-b border-[#F2F4F7] gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-black rounded-lg overflow-hidden shrink-0">
            <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[#475467]">Manage Event:</p>
            <h1 className="text-lg sm:text-xl font-semibold text-[#101828] line-clamp-2">Crypto Art Lagos 2025</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="gradient"
            className="h-10 px-3 sm:px-5 text-xs sm:text-sm font-medium flex-1 sm:flex-initial"
          >
            ✏️ Edit Event
          </Button>
          <Button
            variant="outline"
            className="h-10 px-3 sm:px-5 text-xs sm:text-sm font-medium text-[#6917AF] border-[#6917AF] hover:bg-[#6917AF]/5 flex-1 sm:flex-initial whitespace-nowrap"
          >
            👁️ Preview
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 bg-white border-b border-[#F2F4F7]">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-1 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-[#6917AF]'
                : 'text-[#475467] hover:text-[#6917AF]'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6917AF]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-1 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'messaging'
                ? 'text-[#6917AF]'
                : 'text-[#475467] hover:text-[#6917AF]'
            }`}
          >
            Messaging Center
            {activeTab === 'messaging' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6917AF]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        {activeTab === 'overview' && (
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
        )}

        {activeTab === 'messaging' && (
          <div className="text-center py-12">
            <p className="text-[#667085]">Messaging Center content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
