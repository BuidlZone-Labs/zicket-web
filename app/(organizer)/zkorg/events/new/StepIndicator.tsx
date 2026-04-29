"use client"

import React from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  label: string
  icon?: React.ReactNode
  className?: string
}

export function StepIndicator({
  currentStep,
  totalSteps,
  label,
  icon,
  className,
}: StepIndicatorProps) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div className={cn("space-y-3", className)} aria-label={`${label}, step ${currentStep} of ${totalSteps}`}>
      <div className="flex items-center gap-2">
        {icon ?? <FileText className="size-5 text-[#667085] dark:text-[#808080]" aria-hidden="true" />}
        <span className="text-sm font-medium text-[#344054] dark:text-[#D0D0D0]">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#667085] dark:text-[#808080]">
          {currentStep} of {totalSteps} Steps
        </span>
        <div
          className="flex-1 h-1.5 rounded-full bg-[#E3E3E3] dark:bg-[#2A2A2A] overflow-hidden"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          aria-label={`${label} progress`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6917AF] to-[#9B4DCA] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
