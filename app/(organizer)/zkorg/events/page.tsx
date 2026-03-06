"use client"

import React from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableEmpty,
} from "@/components/ui/table"
import { InputWithIcon } from "@/components/ui/input"
import { EventPageLink } from "@/app/components/organizer/EventPageLink"
import {
  EventSidebarPreviewCard,
  type EventPreviewData,
} from "@/app/components/organizer/EventSidebarPreviewCard"

const sampleEvent: EventPreviewData = {
  title: "Solana Summer Hackathon",
  image: "/images/explore/1.png",
  date: "Jun. 04 2025",
  time: "4:00 pm (UTC +01:00)",
  location: "Accra, Ghana",
  price: 0,
  isPaid: false,
  status: "draft",
  tags: ["Solana", "CryptoBuilders", "HackathonNG"],
  slotsLeft: 120,
  description:
    "Join Africa's brightest minds in blockchain and web3 at the Solana Summer Hackathon.",
}

const tableColumns = [
  { id: "name", label: "Event Name" },
  { id: "date", label: "Date" },
  { id: "status", label: "Status" },
  { id: "tickets", label: "Tickets Sold" },
  { id: "revenue", label: "Revenue" },
]

export default function OrgEvents() {
  const handlePreview = () => {
    window.open(`/explore/solana-summer-hackathon`, "_blank")
  }

  return (
    <div className="flex gap-6 p-6 lg:p-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#101828] dark:text-white">
              Events
            </h1>
            <p className="text-sm text-[#667085] dark:text-[#808080] mt-1">
              Manage and track all your events
            </p>
          </div>
          <Button variant="gradient" className="gap-2 rounded-lg self-start" asChild>
            <Link href="/zkorg/events/new">
              <Plus className="size-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Event Page Link */}
        <EventPageLink
          eventUrl="https://zicket.xyz/explore/solana-summer-hackathon"
          onPreview={handlePreview}
        />

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-sm">
            <InputWithIcon
              icon={<Search className="size-4" />}
              placeholder="Search events..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">All</Badge>
            <Badge variant="draft">Draft</Badge>
            <Badge variant="verified">Live</Badge>
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((col) => (
                  <TableHead key={col.id}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty
                colSpan={tableColumns.length}
                message="No events yet"
                description="Create your first event to get started"
              />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sidebar Preview */}
      <aside className="hidden lg:block w-[340px] shrink-0">
        <div className="sticky top-24 space-y-4">
          <h2 className="text-sm font-semibold text-[#344054] dark:text-[#D0D0D0]">
            Event Preview
          </h2>
          <EventSidebarPreviewCard
            event={sampleEvent}
            onPreview={handlePreview}
          />
        </div>
      </aside>
    </div>
  )
}
