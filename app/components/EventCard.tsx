"use client";

import Image from "next/image";
import Link from "next/link";
import { explorePathForEventTitle } from "@/lib/dummyEvents/explorePath";
import { useSimulatedAvailability } from "@/lib/hooks/useSimulatedAvailability";

type EventCardProps = {
  image?: string;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  price?: string;
  eventId?: string;
};

export default function EventCard({
  image = "/assets/slider/1.png",
  title = "Zicket Caption",
  date = "Jun. 04 2025",
  time = "4:00 pm (UTC +01:00)",
  location = "London, UK",
  price = "$100.00",
  eventId,
}: EventCardProps) {
  const { slotsLeft, isSoldOut } = useSimulatedAvailability(eventId);

  const exploreHref = explorePathForEventTitle(title);

  return (
    <div className="bg-white dark:bg-transparent rounded-2xl shadow p-0 flex flex-col w-[290px] max-w-full border border-[#E5E5E5] dark:border-[#232323] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-1 pb-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          width={266}
          height={150}
          className="rounded-xl object-cover w-full h-[150px] bg-[#E5E5E5] transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 pt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-[16px] text-black dark:text-white truncate">
            {title}
          </span>
          <button
            className="rounded-full flex items-center justify-center w-screen h-screen max-w-[34px] max-h-[34px] cursor-pointer transition-transform duration-200 hover:scale-110"
            title="Share"
          >
            <Image
              src="/assets/icons/shareIcon.svg"
              alt="Share"
              width={34}
              height={34}
              className="dark:hidden"
            />
            <Image
              src="/assets/icons/shareDarkIcon.svg"
              alt="Share"
              width={34}
              height={34}
              className="hidden dark:block"
            />
          </button>
        </div>
        <div className="flex flex-col gap-1 text-[14px] [color:var(--color-card-detail)]">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/calendarIcon.svg"
              alt="Date"
              width={16}
              height={16}
            />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/clockIcon.svg"
              alt="Time"
              width={16}
              height={16}
            />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/locationIcon.svg"
              alt="Location"
              width={16}
              height={16}
            />
            <span>{location}</span>
          </div>
        </div>
        {eventId && (
          <p
            className="text-xs font-medium text-[#667085] dark:text-[#808080]"
            aria-live="polite"
          >
            {isSoldOut ? (
              <span className="text-[#B42318] dark:text-[#F97066]">
                Sold out
              </span>
            ) : (
              <>
                <span className="text-[#6917AF] dark:text-[#D7B5F5]">
                  {slotsLeft}
                </span>{" "}
                slots left
              </>
            )}
          </p>
        )}
        <hr className="my-2 border-t border-[var(--color-card-divider)] dark:border-[var(--color-card-divider-dark)]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-bold text-[18px] text-black dark:text-white">
            <Image
              src="/assets/icons/ticketIcon.svg"
              alt="Ticket"
              width={20}
              height={20}
            />
            {price}
          </div>
          {eventId && !isSoldOut ? (
            <Link
              href={exploreHref}
              className="flex items-center gap-1 text-[14px] font-semibold [color:var(--color-text-detail)] dark:[color:var(--color-text-main-dark)] cursor-pointer transition-all duration-200 hover:gap-2"
            >
              Get Ticket
              <Image
                src="/assets/icons/arrowRightIcon.svg"
                alt="arrow"
                width={18}
                height={18}
                className="dark:hidden"
              />
              <Image
                src="/assets/icons/arrowRightDarkIcon.svg"
                alt="arrow"
                width={18}
                height={18}
                className="hidden dark:block"
              />
            </Link>
          ) : eventId && isSoldOut ? (
            <span className="text-[14px] font-semibold text-[#98A2B3] dark:text-[#667085] cursor-default">
              Sold out
            </span>
          ) : (
            <button className="flex items-center gap-1 text-[14px] font-semibold [color:var(--color-text-detail)] dark:[color:var(--color-text-main-dark)] cursor-pointer transition-all duration-200 hover:gap-2">
              Get Ticket
              <Image
                src="/assets/icons/arrowRightIcon.svg"
                alt="arrow"
                width={18}
                height={18}
                className="dark:hidden"
              />
              <Image
                src="/assets/icons/arrowRightDarkIcon.svg"
                alt="arrow"
                width={18}
                height={18}
                className="hidden dark:block"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
