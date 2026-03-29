"use client";

import { useState, use } from "react";
import Link from "next/link";
import EventSlider from "@/app/components/EventSlider";
import { PurchasedStage } from "@/app/components/explore/EventCheckout/PurchasedStage";
import { TicketCancellationModal } from "@/app/components/TicketCancellationModal";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { EventDetailCard } from "@/app/components/explore/EventCheckout/eventDetailsCard";
import { WhatYouWillGetCard } from "@/app/components/explore/EventCheckout/WhatYouWillGetCard";
import { OrganizerCard } from "@/app/components/explore/EventCheckout/OrganizerCard";
import { TicketInfo } from "@/app/components/explore/EventCheckout/TicketInfo";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default function EventPage({ params }: Props) {
  const { eventId } = use(params);
  const eventName = eventId.replaceAll("-", " ");

  const event = dummyEvents.filter(
    (event) => event.title.toLocaleLowerCase() === eventName.toLocaleLowerCase()
  );

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isPurchased = isConfirmed && isPaid;

  const handleStatusChange = (status: { isConfirmed: boolean; isPaid: boolean }) => {
    setIsConfirmed(status.isConfirmed);
    setIsPaid(status.isPaid);
  };

  if (!event || event.length === 0) return <div className="p-20 text-center">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-15 py-20 px-4">
      <div className="flex gap-1 items-center w-[calc(100vw - 20px)] lg:w-[436px]">
        <Link
          href="/explore"
          className="text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] capitalize"
        >
          explore
        </Link>
        <span className="text-[#667185]">/</span>
        <p className="w-fit text-xs md:text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] line-clamp-1 flex-shrink">
          Web3 & Crypto Meetups
        </p>
        <span className="text-[#667185]">/</span>
        <p className="w-1/3 md:w-fit text-sm font-medium text-[#667185] line-clamp-1 flex-shrink min-w-0">
          {eventName}
        </p>
      </div>

      {!isPurchased ? (
        <div className="space-y-16">
          <EventDetailCard
            title={event[0].title}
            date={event[0].date}
            time={event[0].time}
            type={event[0].location}
            description={event[0].description}
            tags={event[0].tags}
            price={event[0].price}
            privacyType={event[0].privacyLevel[0]}
          />
          <div className="flex gap-5 sm:flex-row flex-col">
            <div className="space-y-5 basis-[55%]">
              <WhatYouWillGetCard perks={event[0].perks} />
              <OrganizerCard {...event[0].organizer} />
            </div>
            <div className="basis-[45%]">
              <TicketInfo
                ticketTypes={event[0].ticketTypes}
                slotsLeft={event[0].slotsLeft}
                privacyLevel={event[0].privacyLevel}
                isPaid={event[0].isPaid}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[550px] mx-auto py-10">
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

      <div className="pt-5">
        <EventSlider />
      </div>
    </div>
  );
}
