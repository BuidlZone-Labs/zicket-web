"use client"

import React from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Ticket, Eye } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"

export interface EventPreviewData {
  title: string
  image: string
  date: string
  time: string
  location: string
  price: number
  isPaid: boolean
  status: "draft" | "verified" | "live"
  tags: string[]
  slotsLeft?: number
  description?: string
}

interface EventSidebarPreviewCardProps {
  event: EventPreviewData
  className?: string
  onPreview?: () => void
}

const statusBadgeVariant: Record<
  EventPreviewData["status"],
  "draft" | "verified" | "free"
> = {
  draft: "draft",
  verified: "verified",
  live: "free",
}

const statusLabel: Record<EventPreviewData["status"], string> = {
  draft: "Draft",
  verified: "Verified",
  live: "Live",
}

export function EventSidebarPreviewCard({
  event,
  className,
  onPreview,
}: EventSidebarPreviewCardProps) {
  const {
    title,
    image,
    date,
    time,
    location,
    price,
    isPaid,
    status,
    tags,
    slotsLeft,
    description,
  } = event

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-white dark:bg-[#141414] overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 360px"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={statusBadgeVariant[status]}>
            {statusLabel[status]}
          </Badge>
        </div>
        {!isPaid && (
          <div className="absolute top-3 right-3">
            <Badge variant="free">FREE</Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-4 p-4">
        <h3 className="text-base font-semibold text-[#1E1E1E] dark:text-white line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-[#667085] dark:text-[#808080] line-clamp-2">
            {description}
          </p>
        )}

        {/* Event Details */}
        <div className="flex flex-col gap-2">
          <DetailRow icon={Calendar} label={date} />
          <DetailRow icon={Clock} label={time} />
          <DetailRow icon={MapPin} label={location} />
          <DetailRow
            icon={Ticket}
            label={isPaid ? `$${price.toFixed(2)}` : "Free"}
            labelClassName={
              isPaid
                ? "font-semibold text-[#1E1E1E] dark:text-white"
                : "font-semibold text-[#2E7D32] dark:text-[#81C784]"
            }
          />
        </div>

        {/* Slots */}
        {slotsLeft !== undefined && (
          <p className="text-xs text-[#667085] dark:text-[#808080]">
            <span className="font-medium text-[#6917AF] dark:text-[#D7B5F5]">
              {slotsLeft}
            </span>{" "}
            slots left
          </p>
        )}

        {/* Divider */}
        <hr className="border-t border-[#E3E3E3] dark:border-[#2A2A2A]" />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag} variant="default" size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* Preview Button */}
        <Button
          variant="gradient"
          className="w-full gap-2 rounded-lg"
          onClick={onPreview}
        >
          <Eye className="size-4" />
          Preview Event
        </Button>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  labelClassName,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  labelClassName?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#667085] dark:text-[#808080]" />
      <span
        className={cn(
          "text-sm text-[#5C6170] dark:text-[#A0A0A0] truncate",
          labelClassName
        )}
      >
        {label}
      </span>
    </div>
  )
}
