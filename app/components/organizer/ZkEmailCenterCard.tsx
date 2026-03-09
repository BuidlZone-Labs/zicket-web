"use client"

import Image from "next/image"
import React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type MonthOption = { label: string; value: string }

type ZkEmailCenterCardProps = {
  title?: string
  activitiesTitle?: string
  buttonLabel?: string
  monthLabel?: string
  monthOptions?: MonthOption[]
  selectedMonth?: string
  onMonthChange?: (value: string) => void
  messagesSent?: number
  scheduledUpdates?: number
  autoConfirmationsOn?: boolean
  onToggleAutoConfirm?: (value: boolean) => void
  onSendNewMessage?: () => void
  emptyStateText?: string
}

export default function ZkEmailCenterCard({
  title = "zkEmail Center",
  activitiesTitle = "Activities",
  buttonLabel = "Send New Message",
  monthLabel = "This Month",
  monthOptions = [
    { label: "This Month", value: "30" },
    { label: "This Week", value: "7" },
    { label: "This Year", value: "365" },
  ],
  selectedMonth,
  onMonthChange,
  messagesSent = 3,
  scheduledUpdates = 1,
  autoConfirmationsOn = true,
  onToggleAutoConfirm,
  onSendNewMessage,
  emptyStateText = "No Data to Show yet...",
}: ZkEmailCenterCardProps) {
  const hasActivity = messagesSent > 0 || scheduledUpdates > 0 || autoConfirmationsOn

  return (
    <Card className="bg-white rounded-2xl border shadow-sm">
      <CardHeader className="flex items-center justify-between gap-3 border-b">
        <div className="flex items-center gap-3">
          <Image src="/ZKEmail.svg" alt="zkEmail" width={32} height={32} />
          <CardTitle className="text-[#1E1E1E] font-medium text-[16px] leading-[100%]">{title}</CardTitle>
        </div>
        <CardAction>
          <Select
            value={selectedMonth}
            onValueChange={onMonthChange}
          >
            <SelectTrigger className="w-[130px] rounded-full font-medium text-[#1E1E1E] leading-[100%]">
              <SelectValue placeholder={monthLabel} className="placeholder-[#1E1E1E]" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        <div className="p-4 rounded-[8px] min-h-[114px] space-y-4 bg-background-light text-[#1E1E1E]">
          <h3 className="text-sm font-medium">{activitiesTitle}</h3>

          {!hasActivity ? (
            <p className="text-center my-auto">{emptyStateText}</p>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <Image src="/message-upload.svg" alt="messages sent" width={24} height={24} />
                <p className="text-sm">{`${messagesSent} ${messagesSent === 1 ? "message" : "messages"} sent`}</p>
              </div>

              <div className="flex items-center gap-3">
                <Image src="/time.svg" alt="scheduled update" width={24} height={24} />
                <p className="text-sm">{`${scheduledUpdates} ${scheduledUpdates === 1 ? "scheduled update" : "scheduled updates"}`}</p>
              </div>

              <div
                role="button"
                aria-pressed={autoConfirmationsOn}
                onClick={() => onToggleAutoConfirm?.(!autoConfirmationsOn)}
                className="flex items-center gap-3 cursor-pointer select-none"
                title="Toggle auto-confirmations"
              >
                <Image src="/notification.svg" alt="auto-confirmations" width={24} height={24} />
                <p className="text-sm flex items-center gap-2">
                  <span>Auto-confirmations: {autoConfirmationsOn ? "ON" : "OFF"}</span>
                  <span
                    aria-hidden="true"
                    className={`inline-block size-2 rounded-full ${autoConfirmationsOn ? "bg-green-600" : "bg-muted-foreground"}`}
                  />
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4">
        <Button
          size="lg"
          className="w-full rounded-full py-3 px-6 font-bold text-sm text-[#6917AF] border border-[#6917AF] bg-transparent hover:bg-background-light"
          icon={<ChevronRight />}
          onClick={onSendNewMessage}
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
