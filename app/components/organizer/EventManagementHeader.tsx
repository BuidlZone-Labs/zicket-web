"use client"

import React from "react"
import Image from "next/image"
import { Eye, SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EventManagementHeaderProps {
  logoSrc: string
  eventTitle: string
  onEditEvent?: () => void
  onPreviewEventPage?: () => void
}

export function EventManagementHeader({
  logoSrc,
  eventTitle,
  onEditEvent,
  onPreviewEventPage,
}: EventManagementHeaderProps) {
  return (
    <header className="rounded-2xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-white dark:bg-[#141414] p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="relative size-12 sm:size-14 overflow-hidden rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-[#F9FAFB] dark:bg-[#1C1C1C] shrink-0">
            <Image
              src={logoSrc}
              alt={`${eventTitle} logo`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#667085] dark:text-[#A0A0A0]">
              Manage Event:
            </p>
            <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-[#101828] dark:text-white truncate">
              {eventTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
          <Button
            variant="gradient"
            className="h-11 px-5 rounded-lg gap-2 hover:shadow-lg"
            onClick={onEditEvent}
          >
            <SquarePen className="size-4" />
            Edit Event
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5 rounded-lg gap-2 border-[#6917AF] text-[#6917AF] hover:bg-[#F3E8FF] hover:text-[#5A12A0] dark:border-[#D7B5F5] dark:text-[#D7B5F5] dark:hover:bg-[#6917AF]/20"
            onClick={onPreviewEventPage}
          >
            <Eye className="size-4" />
            Preview Event Page
          </Button>
        </div>
      </div>
    </header>
  )
}
