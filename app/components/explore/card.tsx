"use client";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  ShareIcon,
  TicketIcon,
} from "@/public/svg/svg";
import { useRouter } from "next/navigation";
import { Event, PrivacyLevel } from "@/lib/dummyEvents/events";
import Image from "next/image";

function Card({ title, date, time, location, price, image, privacyLevel }: Event) {
  const router = useRouter();

  const handleNavigate = (eventId: string) => {
    const path = `/explore/${eventId}`.replaceAll(" ", "-");
    router.push(path);
  };

  const getPrivacyLevel = (privacyLevel: PrivacyLevel) => {
    switch (privacyLevel) {
      case "Anonymous":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/shield.svg" alt="Anonymous" width={16} height={16} />
          Anonymous
          </span>;
      case "Verified Access":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/lock.svg" alt=" Verified Access" width={16} height={16} />
          Verified Access
          </span>;
      case "Wallet Required":
        return <span className="flex gap-2 items-center bg-[#FFFFFF99] text-[#1E1E1E] px-2 py-1 rounded-[8px] text-xs font-semibold">
          <Image src="/images/explore/privacy/key.svg" alt="Wallet Required" width={16} height={16} />
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
      <div className="relative border rounded-xl border-[#E9E9E9]">
        <img src={image} alt="" />
        <div className="absolute top-2 left-2">
          {getPrivacyLevel(privacyLevel)}
        </div>
      </div>
      <div className="p-4  w-full space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-base font-semibold text-black max-w-[22ch] truncate">
              {title}
            </p>
            <div className="bg-[#FBE7D3] size-9 rounded-full flex items-center justify-center">
              <ShareIcon />
            </div>
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
          <hr className="border border-[#E9E9E9] w-full" />
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <TicketIcon />
              {getPrice(price)}
            </div>
            <button
              role="link"
              className="cursor-pointer flex items-center text-base font-semibold text-[#2C0A4A] group w-fit"
              onClick={() => handleNavigate(title)}
            >
              Get Ticket{" "}
              <span className="group-hover:translate-x-1 transition ease-in-out duration-150">
                <ArrowRightIcon />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
