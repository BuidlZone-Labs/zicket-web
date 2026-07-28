"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Ticket as TicketIcon,
  Lock,
} from "lucide-react";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { ExpiryIndicator } from "./ExpiryIndicator";
import { PrivateShareModal } from "./PrivateShareModal";
import {
  buildTicketQrPayload,
  formatEventDate,
  formatEventTime,
  getTicketState,
} from "@/lib/tickets";
import type { PurchasedTicket } from "@/lib/dummyEvents/tickets";
import type { Event } from "@/lib/dummyEvents/events";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E9E9E9] dark:border-[#232323] bg-[#F9FAFB] dark:bg-[#121212] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#667185]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
        {value}
      </p>
    </div>
  );
}

export function TicketDetail({
  ticket,
  event,
}: {
  ticket: PurchasedTicket;
  event: Event;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  // Coarse initial state for the QR emphasis; the ExpiryIndicator handles the
  // live-updating detail.
  const state = getTicketState(ticket);
  const qrActive = state === "live" || state === "upcoming";
  const qrPayload = buildTicketQrPayload(ticket);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/tickets"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#5C6170] dark:text-[#98A2B3] hover:text-[#6917AF] dark:hover:text-[#D7B5F5]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        My Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: event + details */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#E9E9E9] dark:border-[#232323]">
            <Image
              src={event.image}
              alt={event.title}
              width={800}
              height={360}
              className="h-[220px] w-full object-cover bg-[#E5E5E5]"
            />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-[#4ADE80]" />
              SAFE MODE
            </span>
            <div className="absolute top-4 right-4">
              <TicketStatusBadge state={state} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#1F1F1F] dark:text-white">
              {event.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5C6170] dark:text-[#98A2B3]">
              <span className="flex items-center gap-2">
                <Calendar aria-hidden="true" className="size-4" />
                {formatEventDate(ticket.eventStart)}
              </span>
              <span className="flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4" />
                {formatEventTime(ticket.eventStart)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4" />
                {event.location}
              </span>
            </div>
          </div>

          <ExpiryIndicator ticket={ticket} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoTile label="Ticket" value={ticket.ticketType} />
            {ticket.seat && <InfoTile label="Seat" value={ticket.seat} />}
            {ticket.section && <InfoTile label="Section" value={ticket.section} />}
            <InfoTile label="Privacy" value={ticket.privacyLevel} />
          </div>
        </div>

        {/* Right: QR + actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E9E9E9] dark:border-[#232323] bg-white dark:bg-[#0A0A0A] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
                Entry QR
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#667185]">
                <Lock aria-hidden="true" className="size-3.5" />
                Private &amp; encrypted
              </span>
            </div>

            <div className="mt-4 flex justify-center">
              <div
                className={`rounded-2xl border border-[#E9E9E9] bg-white p-4 ${qrActive ? "" : "opacity-40 grayscale"}`}
              >
                <QRCodeSVG value={qrPayload} size={220} level="M" className="block" />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-[#667185]">
              {qrActive
                ? "Show this code at the entry gate. It carries no personal data."
                : state === "used"
                  ? "This ticket has been scanned and is no longer active."
                  : "This ticket has expired and can no longer be scanned."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6917AF] py-3.5 font-bold text-white transition hover:bg-[#5A1296] dark:bg-[#751AC6]"
          >
            <Share2 aria-hidden="true" className="size-5" />
            Share privately
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#6917AF] py-3.5 font-bold text-[#6917AF] dark:text-[#D7B5F5] transition hover:bg-[#6917AF]/5"
          >
            <Wallet aria-hidden="true" className="size-5" />
            Add to Apple Wallet
          </button>

          <Link
            href={`/explore/${event.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold text-[#5C6170] dark:text-[#98A2B3] hover:text-[#6917AF] dark:hover:text-[#D7B5F5]"
          >
            <TicketIcon aria-hidden="true" className="size-4" />
            View event page
          </Link>
        </div>
      </div>

      <PrivateShareModal
        ticket={ticket}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
