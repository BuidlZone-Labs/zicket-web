"use client"

import React from "react"
import { BarChart3, UsersRound } from "lucide-react"

import { EventManagementHeader } from "@/app/components/organizer/EventManagementHeader"
import { EventPageLink } from "@/app/components/organizer/EventPageLink"
import ZkEmailCenter from "@/app/components/organizer/ZkEmailCenter"

const metricCards = [
  { label: "Total Attendees", value: "154", change: "+43" },
  { label: "% Anonymous", value: "72%", change: "+21%" },
  { label: "Verified (zkPassport)", value: "43", change: "" },
  { label: "Revenue", value: "42 USDC", change: "" },
]

export default function OrganizerEventDetailsPage() {
  const handlePreview = () => {
    window.open("/explore/solana-summer-hackathon", "_blank")
  }

  const handleEditEvent = () => {
    window.alert("Edit Event flow coming soon")
  }

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <EventManagementHeader
        logoSrc="/images/solana-summar.png"
        eventTitle="Crypto Art Lagos 2025"
        onEditEvent={handleEditEvent}
        onPreviewEventPage={handlePreview}
      />

      <div className="flex items-center gap-6 border-b border-[#EAECF0] dark:border-[#2A2A2A]">
        <button className="pb-3 text-sm font-medium text-[#6917AF] border-b-2 border-[#6917AF]">
          Overview
        </button>
        <button className="pb-3 text-sm font-medium text-[#475467] hover:text-[#6917AF] transition-colors">
          Messaging Center
        </button>
      </div>

      <section className="rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-white dark:bg-[#141414]">
        <header className="flex items-center justify-between border-b border-[#EAECF0] dark:border-[#2A2A2A] p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#F2F4F7] dark:bg-[#1C1C1C]">
              <BarChart3 className="size-4 text-[#667085]" />
            </div>
            <h2 className="text-base font-medium text-[#1D2939] dark:text-white">
              Key Metrics
            </h2>
          </div>
          <span className="rounded-full border border-[#E4E7EC] px-3 py-1 text-xs text-[#344054]">
            Today
          </span>
        </header>

        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-[#EAECF0] dark:border-[#2A2A2A] bg-[#FCFCFD] dark:bg-[#1C1C1C] p-4"
            >
              <p className="text-sm text-[#344054] dark:text-[#D0D0D0]">
                {card.label}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold text-[#101828] dark:text-white">
                  {card.value}
                </p>
                {card.change ? (
                  <span className="rounded-full bg-[#EAECF0] px-2 py-0.5 text-xs text-[#344054]">
                    {card.change}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <EventPageLink
        eventUrl="https://zicket.io/CryptoArtLagos2025/1788569"
        onPreview={handlePreview}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-white dark:bg-[#141414] overflow-hidden">
          <header className="grid grid-cols-3 gap-3 border-b border-[#EAECF0] dark:border-[#2A2A2A] p-4 text-xs font-medium text-[#667085] uppercase tracking-wide">
            <span>Attendance Type</span>
            <span>Count</span>
            <span>Percentage (%)</span>
          </header>

          <div className="divide-y divide-[#EAECF0] dark:divide-[#2A2A2A]">
            <Row badge="Wallet-Required" count="111" percentage="32%" />
            <Row badge="Verified Access" count="42" percentage="28%" />
            <Row badge="Anonymous" count="87" percentage="40%" />
          </div>
        </div>

        <ZkEmailCenter />
      </section>
    </div>
  )
}

function Row({
  badge,
  count,
  percentage,
}: {
  badge: string
  count: string
  percentage: string
}) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4 text-sm text-[#475467] dark:text-[#D0D0D0]">
      <div className="flex items-center gap-2">
        <UsersRound className="size-4 text-[#667085]" />
        <span>{badge}</span>
      </div>
      <span>{count}</span>
      <span>{percentage}</span>
    </div>
  )
}
