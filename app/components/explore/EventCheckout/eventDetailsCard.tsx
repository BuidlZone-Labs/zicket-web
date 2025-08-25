import dummyImage from "@/public/images/solana_summer_game.jpg";
import {
  CalendarIcon,
  ClockIcon,
  KeyIcon,
  LocationIcon,
  LockIcon,
  ShareIcon,
  ShiedIcon,
  TagIcon,
  TicketIconSmall,
} from "@/public/svg/svg";
import Image from "next/image";
import { FC } from "react";

interface EventDetailCardProps {
  title: string;
  date: string;
  time: string;
  type: string;
  description: string;
  tags: string[];
  price?: number;
  privacyType: string;
}
export const EventDetailCard: FC<EventDetailCardProps> = ({
  title,
  date,
  time,
  type,
  description,
  tags,
  price,
  privacyType,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full dark:bg-[#0D0D0D] bg-white">
      <div className="rounded-xl  overflow-hidden flex-1  border dark:border-[#232323] border-[">
        <img src={dummyImage.src} alt="" className="size-full object-cover" />
        {/* <Image
          src={dummyImage.src}
          alt="dummy Image"
          width={100}
          height={100}
        /> */}
      </div>
      <div className="flex-1 space-y-10 p-4">
        <div className="space-y-10">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-2xl text-nowrap truncate sm:text-[2rem] font-semibold">
              {title}
            </h1>
            <div
              role="link"
              className="bg-[#FBE7D3] size-9 rounded-full flex items-center justify-center cursor-pointer"
            >
              <ShareIcon />
            </div>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <CalendarIcon />
              <p className="text-[#5C6170] text-sm sm:text-base">{date}</p>
            </div>
            <div className="flex gap-2">
              <ClockIcon />
              <p className="text-[#5C6170] text-sm sm:text-base">{time}</p>
            </div>
            <div className="flex gap-2">
              <LocationIcon />
              <p className="text-[#5C6170] text-sm sm:text-base">{type}</p>
            </div>
            <div className="flex gap-2 items-center">
              <TicketIconSmall />
              <p className="text-[#1E1E1E] font-medium text-lg capitalize">
                {price ? "paid" : "Free"}
              </p>
            </div>
            <div className="flex gap-1 border-[0.5px] rounded-lg border-[#E9E9E9] px-3 py-1.5 items-center">
              {privacyType === "Wallet Required" ? (
                <KeyIcon />
              ) : privacyType === "Verified Access" ? (
                <LockIcon />
              ) : (
                <ShiedIcon />
              )}
              <p className="text-[#5C6170] text-xs font-medium">
                {privacyType}
              </p>
            </div>
          </div>
        </div>
        <hr className="w-full h-0.5" />
        <div className="space-y-6">
          <p className="text-base font-medium text-[#7D7D7D]">About Event</p>
          <p className="text-[#454545]">{description}</p>
        </div>
        <hr className="w-full h-0.5" />

        <div className="space-y-4">
          <p className="flex gap-2 text-[#5C6170]">
            <TagIcon />
            <span>Tags:</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, index) => (
              <div className="py-1 px-2 rounded-md bg-[#EEEFF2] dark:bg-[#1C1C1C] text-[#5C6170] font-normal text-sm ">
                {tag}
              </div>
            ))}
          </div>
        </div>
        <hr className="w-full h-0.5" />
      </div>
    </div>
  );
};
