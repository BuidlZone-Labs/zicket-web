"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableEmpty,
} from "@/components/ui/table"
import { InputWithIcon } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"

const tableColumns = [
  { id: "name", label: "Event Name" },
  { id: "date", label: "Date" },
  { id: "status", label: "Status" },
  { id: "tickets", label: "Tickets Sold" },
  { id: "revenue", label: "Revenue" },
]

export default function OrgEvents() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // Use debounced search query for API calls
  useEffect(() => {
    if (debouncedSearchQuery) {
      // TODO: Replace with actual search API call
      console.log("Searching events for:", debouncedSearchQuery)
      // Example: searchEvents(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery])

  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#101828] dark:text-white">
              Events
            </h1>
            <p className="mt-1 text-sm text-[#667085] dark:text-[#808080]">
              Open an event to manage details, analytics, and attendee actions.
            </p>
          </div>
          <Button variant="gradient" className="gap-2 rounded-lg self-start" asChild>
            <Link href="/zkorg/events/new">
              <Plus className="size-4" />
              Create Event
            </Link>
          </Button>
          <Button asChild variant="outline" className="self-start">
            <Link href="/zkorg/events/crypto-art-lagos-2025">
              Open sample event details
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-sm">
            <InputWithIcon
              icon={<Search className="size-4" />}
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">All</Badge>
            <Badge variant="draft">Draft</Badge>
            <Badge variant="verified">Live</Badge>
          </div>
        </div>

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
    </div>
  )
}
