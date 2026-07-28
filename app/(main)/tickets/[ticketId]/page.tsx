import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/app/components/tickets/TicketDetail";
import { getTicketById, getTicketEvent } from "@/lib/tickets";

type Props = {
  params: Promise<{ ticketId: string }>;
};

// Ticket status depends on the current time, so render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = getTicketById(ticketId);
  const event = ticket ? getTicketEvent(ticket) : undefined;

  if (!ticket || !event) {
    return { title: "Ticket Not Found | Zicket" };
  }

  return {
    title: `${event.title} · Your Ticket | Zicket`,
    description: `Your ticket for ${event.title}.`,
  };
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const ticket = getTicketById(ticketId);
  const event = ticket ? getTicketEvent(ticket) : undefined;

  if (!ticket || !event) {
    notFound();
  }

  return <TicketDetail ticket={ticket} event={event} />;
}
