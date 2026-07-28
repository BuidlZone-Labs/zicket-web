import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { TicketStatusBadge } from "./TicketStatusBadge";
import {
  formatEventDate,
  formatEventTime,
  getTicketEvent,
  getTicketState,
} from "@/lib/tickets";
import type { PurchasedTicket } from "@/lib/dummyEvents/tickets";

/**
 * One ticket in the wallet/history list. Status is computed server-side at
 * request time (the page is dynamic) so the badge is coherent without any
 * client hydration cost — the live countdown lives on the detail page instead.
 */
export function TicketHistoryCard({ ticket }: { ticket: PurchasedTicket }) {
  const event = getTicketEvent(ticket);
  if (!event) return null;

  const state = getTicketState(ticket);
  const dimmed = state === "used" || state === "expired";

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group flex flex-col rounded-2xl border border-[#E9E9E9] dark:border-[#232323] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative">
        <Image
          src={event.image}
          alt={event.title}
          width={400}
          height={180}
          className={`h-[160px] w-full object-cover bg-[#E5E5E5] ${dimmed ? "opacity-60 grayscale" : ""}`}
        />
        <div className="absolute top-3 left-3">
          <TicketStatusBadge state={state} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg font-semibold text-[#1F1F1F] dark:text-[#E0E0E0] line-clamp-1">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-[#5C6170] dark:text-[#98A2B3]">
          <span className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="size-4 shrink-0" />
            {formatEventDate(ticket.eventStart)}
          </span>
          <span className="flex items-center gap-2">
            <Clock aria-hidden="true" className="size-4 shrink-0" />
            {formatEventTime(ticket.eventStart)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#F0F0F0] dark:border-[#232323] pt-3">
          <span className="text-xs font-medium text-[#667185]">
            {ticket.ticketType}
            {ticket.seat ? ` · Seat ${ticket.seat}` : ""}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#6917AF] dark:text-[#D7B5F5] transition-all group-hover:gap-2">
            View Ticket
            <ChevronRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
