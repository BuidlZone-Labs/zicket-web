"use client"

import React, { useCallback, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EventPageLinkProps {
  eventUrl: string
  className?: string
  onPreview?: () => void
}

export function EventPageLink({
  eventUrl,
  className,
  onPreview,
}: EventPageLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = eventUrl
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [eventUrl])

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E3E3E3] dark:border-[#2A2A2A] bg-white dark:bg-[#141414] p-5",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-[#344054] dark:text-[#D0D0D0]">
          Event page link
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#6917AF] hover:text-[#5A12A0] dark:text-[#D7B5F5] dark:hover:text-[#E8D0FF] gap-1.5 self-start sm:self-auto"
          onClick={onPreview}
        >
          <ExternalLink className="size-4" />
          Preview Event Page
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={eventUrl}
            className="h-10 w-full rounded-lg border border-[#D0D5DD] dark:border-[#404040] bg-[#F9FAFB] dark:bg-[#1C1C1C] px-3 pr-10 text-sm text-[#344054] dark:text-[#D0D0D0] outline-none cursor-default truncate"
            aria-label="Event page URL"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#667085] hover:bg-[#F3E8FF] hover:text-[#6917AF] dark:hover:bg-[#6917AF]/20 dark:hover:text-[#D7B5F5] transition-colors cursor-pointer"
            aria-label={copied ? "Copied to clipboard" : "Copy URL to clipboard"}
          >
            {copied ? (
              <Check className="size-4 text-[#2E7D32]" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      {copied && (
        <p
          className="mt-2 text-xs text-[#2E7D32] dark:text-[#81C784] animate-fade-in"
          role="status"
          aria-live="polite"
        >
          Copied to clipboard!
        </p>
      )}
    </div>
  )
}
