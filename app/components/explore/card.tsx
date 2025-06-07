"use client";
import dummyCardImage from "@/public/images/solana-summar.png";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  ShareIcon,
  TicketIcon,
} from "@/public/svg/svg";
import { useRouter } from "next/navigation";
interface CardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
}
function Card({ title, date, time, location, price }: CardProps) {
  const router = useRouter();

  const handleNavigate = (eventId: string) => {
    const path = `/explore/${eventId}`.replaceAll(" ", "-");
    router.push(path);
  };
  return (
    <div className="max-w-sm rounded-2xl p-2 border-2 bg-white border-[#E9E9E9]  flex flex-col items-center">
      <div className="border rounded-xl border-[#E9E9E9]">
        <img src={dummyCardImage.src} alt="" />
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
              <p className="text-xl font-semibold text-[#1E1E1E]">{price}</p>
            </div>
            <button
              role="link"
              className="flex items-center text-base font-semibold text-[#2C0A4A] group w-fit"
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
