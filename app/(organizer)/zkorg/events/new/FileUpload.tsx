"use client"

import React, { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MAX_SIZE_BYTES = 120 * 1024 * 1024 // 120 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"]

export interface FileUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  className?: string
}

export function FileUpload({
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PNG and JPEG images are allowed"
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File size must be less than 120 MB"
    }
    return null
  }, [])

  const handleFile = useCallback(
    (file: File | null) => {
      setValidationError(null)
      if (!file) {
        onChange(null)
        return
      }
      const err = validateFile(file)
      if (err) {
        setValidationError(err)
        onChange(null)
        return
      }
      onChange(file)
    },
    [onChange, validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [disabled, handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ""
    },
    [handleFile]
  )

  const handleBrowse = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        id="cover-image-upload"
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleInputChange}
        onBlur={onBlur}
        className="hidden"
        aria-invalid={!!error}
        aria-describedby="cover-image-upload-help cover-image-upload-error"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 px-6 transition-colors",
          "border-[#E3E3E3] dark:border-[#2A2A2A]",
          "hover:border-[#6917AF]/50 dark:hover:border-[#6917AF]/50",
          error && "border-destructive",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <Upload className="size-10 text-[#667085] dark:text-[#808080]" aria-hidden="true" />
        <p id="cover-image-upload-help" className="text-sm text-[#667085] dark:text-[#808080]">
          Max 120 MB, PNG, JPEG
        </p>
        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="rounded-lg"
          onClick={handleBrowse}
          disabled={disabled}
        >
          Browse File
        </Button>
      </div>
      {(error ?? validationError) && (
        <p id="cover-image-upload-error" className="text-xs text-destructive" role="alert">{error ?? validationError}</p>
      )}
    </div>
  )
}
