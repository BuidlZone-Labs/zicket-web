import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TicketHistoryCard } from "@/app/components/tickets/TicketHistoryCard";
import EventSlider from "@/app/components/EventSlider";
import { getUserTickets } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "My Tickets | Zicket",
  description: "View, use, and privately share the tickets you own.",
};

// Ticket status depends on the current time, so render per request.
export const dynamic = "force-dynamic";

function FindMoreEventsCard() {
  return (
    <Link
      href="/explore"
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#D4ADFC] dark:border-[#4A1F7A] bg-[#F5EEFF] dark:bg-[#1C0F2E] p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl min-h-[300px]"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-[#6917AF]/10 text-[#6917AF] dark:text-[#D7B5F5]">
        <Plus aria-hidden="true" className="size-6" />
      </span>
      <p className="text-lg font-semibold text-[#6917AF] dark:text-[#D7B5F5]">
        Find More Events
      </p>
      <p className="max-w-[220px] text-sm text-[#6917AF]/80 dark:text-[#D7B5F5]/80">
        Explore the hottest tickets in your city and beyond.
      </p>
      <span className="mt-1 rounded-full bg-[#6917AF] px-5 py-2 text-sm font-semibold text-white transition group-hover:bg-[#5A1296]">
        Explore
      </span>
    </Link>
  );
}

export default function MyTicketsPage() {
  const tickets = getUserTickets();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-white">
          My Tickets
        </h1>
        <p className="mt-2 text-[#5C6170] dark:text-[#98A2B3]">
          Your wallet of tickets — view, use at the gate, and share privately.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketHistoryCard key={ticket.id} ticket={ticket} />
        ))}
        <FindMoreEventsCard />
      </div>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold text-[#1F1F1F] dark:text-white">
          Recommended for you
        </h2>
        <EventSlider />
      </section>
    </div>
  );
}
