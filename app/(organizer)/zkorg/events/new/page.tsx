"use client"

import React, { useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  EventSidebarPreviewCard,
  type EventPreviewData,
} from "@/app/components/organizer/EventSidebarPreviewCard"
import { BasicInfoForm } from "./BasicInfoForm"
import type { BasicInfoEventFormValues } from "@/lib/validations/event-schema"

function stripHtml(html: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").trim()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "—"
  const [hours, minutes] = timeStr.split(":")
  const h = parseInt(hours, 10)
  const m = minutes ?? "00"
  if (h === 12) return `12:${m} PM`
  if (h === 0) return `12:${m} AM`
  return h > 12 ? `${h - 12}:${m} PM` : `${h}:${m} AM`
}

export default function AddNewEventPage() {
  const router = useRouter()

  const [formValues, setFormValues] = React.useState<Partial<BasicInfoEventFormValues>>({})

  const coverPreviewUrl = useMemo(() => {
    const file = formValues.coverImage
    if (!file || typeof window === "undefined") return null
    return URL.createObjectURL(file)
  }, [formValues.coverImage])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPreviewUrl])

  const handleSubmit = (_data: BasicInfoEventFormValues) => {
    // Step 2 not implemented yet; could navigate to ?step=2 or a separate route
    router.push("/zkorg/events/new?step=2")
  }

  const previewEvent: EventPreviewData = useMemo(() => {
    const d = formValues
    const title = d?.title?.trim() || "Crypto Art Lagos 2025"
    const description = d?.description ? stripHtml(d.description).slice(0, 120) : undefined
    const date = d?.startDate ? formatDate(d.startDate) : "Feb. 08 2025"
    const time = d?.startTime ? formatTime(d.startTime) : "6:00 PM"
    const tags = d?.tags?.length ? d.tags : ["DAO", "TECH"]
    const image = coverPreviewUrl ?? "/images/explore/1.png"

    return {
      title,
      image,
      date,
      time,
      location: "Location TBA",
      price: 0,
      isPaid: false,
      status: "draft",
      tags,
      description,
    }
  }, [formValues, coverPreviewUrl])

  return (
    <div className="flex gap-6 p-6 lg:p-8">
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-[#101828] dark:text-white">
            Add New Event
          </h1>
          <p className="text-sm text-[#667085] dark:text-[#808080] mt-1">
            Fill in the basic information for your event
          </p>
        </div>

        <BasicInfoForm onSubmit={handleSubmit} onValuesChange={setFormValues} />
      </div>

      <aside className="hidden lg:block w-[340px] shrink-0">
        <div className="sticky top-24 space-y-4">
          <h2 className="text-sm font-semibold text-[#344054] dark:text-[#D0D0D0]">
            Event Preview
          </h2>
          <EventSidebarPreviewCard event={previewEvent} />
        </div>
      </aside>
    </div>
  )
}
