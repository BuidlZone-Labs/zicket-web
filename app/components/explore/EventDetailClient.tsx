"use client";

import { useState } from "react";
import { PurchasedStage } from "./EventCheckout/PurchasedStage";
import { TicketCancellationModal } from "../TicketCancellationModal";
import { EventDetailCard } from "./EventCheckout/eventDetailsCard";
import { WhatYouWillGetCard } from "./EventCheckout/WhatYouWillGetCard";
import { OrganizerCard } from "./EventCheckout/OrganizerCard";
import { TicketInfo } from "./EventCheckout/TicketInfo";
import type { Event } from "@/lib/dummyEvents/events";

interface EventDetailClientProps {
  event: Event;
}

/**
 * Client component for interactive event details
 * Receives pre-fetched server data as props (SSR)
 * Handles client-side state for purchase flow and modals
 */
export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isPurchased = isConfirmed && isPaid;

  const handleStatusChange = (status: { isConfirmed: boolean; isPaid: boolean }) => {
    setIsConfirmed(status.isConfirmed);
    setIsPaid(status.isPaid);
  };

  return (
    <>
      {!isPurchased ? (
        <div className="space-y-16">
          <EventDetailCard
            title={event.title}
            date={event.date}
            time={event.time}
            type={event.location}
            description={event.description}
            tags={event.tags}
            price={event.price}
            privacyType={event.privacyLevel[0]}
          />
          <div className="flex gap-5 sm:flex-row flex-col">
            <div className="space-y-5 basis-[55%]">
              <WhatYouWillGetCard perks={event.perks} />
              <OrganizerCard {...event.organizer} />
            </div>
            <div className="basis-[45%]">
              <TicketInfo
                ticketTypes={event.ticketTypes}
                slotsLeft={event.slotsLeft}
                privacyLevel={event.privacyLevel}
                isPaid={event.isPaid}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-137.5 mx-auto py-10">
          <PurchasedStage onCancelRegistration={() => setShowCancelModal(true)} />
        </div>
      )}

      <TicketCancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        ticketId="dummy"
        userId="dummy"
        isConfirmed={isConfirmed}
        isPaid={isPaid}
        onConfirm={(_, __, updatedState) => {
          setIsConfirmed(updatedState.isConfirmed);
          setIsPaid(updatedState.isPaid);
          setShowCancelModal(false);
        }}
      />
    </>
  );
}
