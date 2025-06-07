"use client";
import EventSlider from "@/app/components/EventSlider";
import { EventDetailCard } from "@/app/components/explore/EventCheckout/eventDetailsCard";
import { OrganizerCard } from "@/app/components/explore/EventCheckout/OrganizerCard";
import { TicketInfo } from "@/app/components/explore/EventCheckout/TicketInfo";
import { WhatYouWillGetCard } from "@/app/components/explore/EventCheckout/WhatYouWillGetCard";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { useEffect } from "react";

type Props = {
  params: { eventId: string };
};

export default function EventPage({ params }: Props) {
  const eventName = params.eventId.replaceAll("-", " ");
  const event = dummyEvents.filter(
    (event) => event.title.toLocaleLowerCase() === eventName.toLocaleLowerCase()
  );
  useEffect(() => {
    console.log(event);
  }, []);
  return (
    <div className="max-w-7xl mx-auto space-y-15 py-20 px-4">
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] capitalize">
          explore
        </p>
        <span className="text-[#667185]">/</span>
        <p className="text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5]">
          Web3 & Crypto Meetups
        </p>
        <span className="text-[#667185]">/</span>
        <p className="text-sm font-medium text-[#667185]">{eventName}</p>
      </div>
      <div className="space-y-16">
        <EventDetailCard
          title={event[0].title}
          date={event[0].date}
          time={event[0].time}
          type={event[0].type}
          description={event[0].description}
          tags={event[0].tags}
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
            />
          </div>
        </div>
      </div>
      <div className="pt-5">
        <EventSlider />
      </div>
    </div>
  );
}
