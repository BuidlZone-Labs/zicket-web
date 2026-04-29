"use client";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  ShareIcon,
  TicketIcon,
} from "@/public/svg/svg";
import { Event, PrivacyLevel } from "@/lib/dummyEvents/events";
import { explorePathForEventTitle } from "@/lib/dummyEvents/explorePath";
import { useSimulatedAvailability } from "@/lib/hooks/useSimulatedAvailability";
import Image from "next/image";
import Link from "next/link";

function Card({ id, title, date, time, location, price, image, privacyLevel }: Event) {
  const { slotsLeft, isSoldOut } = useSimulatedAvailability(id);

  const getPrivacyLevel = (privacyLevel: PrivacyLevel) => {
    switch (privacyLevel) {
      case "Anonymous":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/shield.svg" alt="" aria-hidden="true" width={16} height={16} />
          Anonymous
          </span>;
      case "Verified Access":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/lock.svg" alt="" aria-hidden="true" width={16} height={16} />
          Verified Access
          </span>;
      case "Wallet Required":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/key.svg" alt="" aria-hidden="true" width={16} height={16} />
          Wallet Required
          </span>;
    }
  };

  const getPrice = (price: number) => {
    if (price === 0) {
      return <p className="text-xl font-semibold text-[#1E1E1E]">Free</p>;
    }
    return <p className="text-xl font-semibold text-[#1E1E1E]">${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>;
  };

  return (
    <div className="max-w-sm rounded-2xl p-2 border-2 bg-white border-[#E9E9E9]  flex flex-col items-center">
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl border border-[#E9E9E9]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-xl"
          sizes="(max-width: 24rem) 100vw, 384px"
        />
        <div className="absolute top-2 left-2">
          {getPrivacyLevel(privacyLevel[0])}
        </div>
      </div>
      <div className="p-4  w-full space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-base font-semibold text-black max-w-[22ch] truncate">
              {title}
            </p>
            <button
              type="button"
              className="bg-[#FBE7D3] size-9 rounded-full flex items-center justify-center"
              aria-label={`Share ${title}`}
            >
              <ShareIcon />
            </button>
          </div>
          <div className="space-y-3">
            <div className="gap-2 flex items-center">
              <CalendarIcon />{" "}
              <p className="text-sm text-[#5C6170] font-normal">{date}</p>
            </div>
            <div className="gap-2 flex items-center">
              <ClockIcon />{" "}
              <p className="text-sm text-[#5C6170] font-normal">{time}</p>
            </div>
            <div className="gap-2 flex items-center">
              <LocationIcon />{" "}
              <p className="text-sm text-[#5C6170] font-normal">{location}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-[#667085]" aria-live="polite">
            {isSoldOut ? (
              <span className="text-[#B42318] font-semibold">Sold out</span>
            ) : (
              <>
                <span className="text-[#6917AF] font-semibold">{slotsLeft}</span> tickets left
              </>
            )}
          </p>
          <hr className="border border-[#E9E9E9] w-full" />
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <TicketIcon />
              {getPrice(price)}
            </div>
            {isSoldOut ? (
              <span className="text-base font-semibold text-[#98A2B3] cursor-default">Sold out</span>
            ) : (
              <Link
                href={explorePathForEventTitle(title)}
                className="cursor-pointer flex items-center text-base font-semibold text-[#2C0A4A] group w-fit"
                aria-label={`Get tickets for ${title}`}
              >
                Get Ticket{" "}
                <span className="group-hover:translate-x-1 transition ease-in-out duration-150">
                  <ArrowRightIcon />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
