import { CheckCircle2, Clock, Radio, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketState } from "@/lib/dummyEvents/tickets";

const CONFIG: Record<
  TicketState,
  { label: string; icon: typeof Clock; className: string; dot?: boolean }
> = {
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    className:
      "bg-[#F3E8FF] text-[#6917AF] dark:bg-[#6917AF]/20 dark:text-[#D7B5F5]",
  },
  live: {
    label: "Live now",
    icon: Radio,
    className:
      "bg-[#ECFDF3] text-[#027A48] dark:bg-[#052E16] dark:text-[#4ADE80]",
    dot: true,
  },
  used: {
    label: "Used",
    icon: CheckCircle2,
    className:
      "bg-[#E5E7EB] text-[#475467] dark:bg-[#2A2A2A] dark:text-[#D0D0D0]",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className:
      "bg-[#FEF3F2] text-[#B42318] dark:bg-[#2D0B09] dark:text-[#F87171]",
  },
};

export function TicketStatusBadge({
  state,
  className,
}: {
  state: TicketState;
  className?: string;
}) {
  const config = CONFIG[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.dot ? (
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
      ) : (
        <Icon aria-hidden="true" className="size-3.5" />
      )}
      {config.label}
    </span>
  );
}
