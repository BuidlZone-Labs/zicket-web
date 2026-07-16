import * as React from "react"
import { FileX2 } from "lucide-react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-wrapper" className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-[#F9FAFB] dark:bg-[#1C1C1C] [&_tr]:border-b",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-[#E3E3E3] dark:border-[#2A2A2A] transition-colors hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle text-xs font-semibold text-[#667085] dark:text-[#A0A0A0] uppercase tracking-wider [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle text-sm text-[#344054] dark:text-[#D0D0D0] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function TableEmpty({
  className,
  colSpan = 1,
  message = "No data available",
  description,
  icon: Icon = FileX2,
  ...props
}: React.ComponentProps<"tr"> & {
  colSpan?: number
  message?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <tr data-slot="table-empty" {...props}>
      <td
        colSpan={colSpan}
        className={cn(
          "py-16 text-center",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-[#F3E8FF] dark:bg-[#6917AF]/20 p-4">
            <Icon className="size-6 text-[#6917AF] dark:text-[#D7B5F5]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#344054] dark:text-[#D0D0D0]">
              {message}
            </p>
            {description && (
              <p className="text-xs text-[#667085] dark:text-[#808080]">
                {description}
              </p>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
}
