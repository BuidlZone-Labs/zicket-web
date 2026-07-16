import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[#EEEFF2] text-[#5C6170] dark:bg-[#1C1C1C] dark:text-[#A0A0A0]",
        primary:
          "bg-[#F3E8FF] text-[#6917AF] dark:bg-[#6917AF]/20 dark:text-[#D7B5F5]",
        outline:
          "border border-[#E3E3E3] text-[#5C6170] dark:border-[#404040] dark:text-[#A0A0A0]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Tag({
  className,
  variant,
  size,
  removable = false,
  onRemove,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof tagVariants> & {
    removable?: boolean
    onRemove?: () => void
  }) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

export { Tag, tagVariants }
