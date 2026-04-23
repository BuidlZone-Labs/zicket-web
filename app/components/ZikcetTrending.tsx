"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock5,
  MapPin,
  Share2,
  TicketPercent,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { explorePathForEventTitle } from "@/lib/dummyEvents/explorePath";
import { useSimulatedAvailability } from "@/lib/hooks/useSimulatedAvailability";

const trendingEvents = dummyEvents.slice(0, 4);

function TrendingEventCard({ card }: { card: (typeof dummyEvents)[number] }) {
  const href = explorePathForEventTitle(card.title);
  const priceLabel = card.isPaid ? `$${card.price.toFixed(2)}` : "Free";
  const { slotsLeft, isSoldOut } = useSimulatedAvailability(card.id);

  return (
    <div className="border border-gray-200 p-1 rounded-md shrink-0">
      <div className="relative h-48 w-[270px] md:w-[385px]">
        <Image alt={card.title} src={card.image} fill className="object-cover rounded-md" />
      </div>
      <div className="px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[17.09px] line-clamp-2">{card.title}</p>
          <Share2 className="text-[#646468] text-[17px] bg-[#FBE7D3] w-[35px] h-[35px] px-2 py-2 rounded-full shrink-0" />
        </div>
        {isSoldOut ? (
          <p className="text-xs font-semibold text-[#B42318] dark:text-[#F97066]" aria-live="polite">
            Sold out
          </p>
        ) : (
          <p className="text-xs text-[#667085] dark:text-[#808080]" aria-live="polite">
            <span className="font-semibold text-[#6917AF] dark:text-[#D7B5F5]">{slotsLeft}</span> slots left
          </p>
        )}
        <div className="flex flex-col gap-2 text-[#6C6C6C] text-[14.95px]">
          <p className="flex items-center justify-start gap-2.5">
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>{card.date}</span>
          </p>
          <p className="flex items-center justify-start gap-1.5">
            <Clock5 className="w-4 h-4 shrink-0" />
            <span>{card.time}</span>
          </p>
          <p className="flex items-center justify-start gap-1.5">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{card.location}</span>
          </p>
        </div>

        <hr />

        <div className="flex justify-between items-center gap-2">
          <p className="flex gap-1.5 items-center justify-start text-[21.36px]">
            <TicketPercent className="text-gray-600 w-4 h-4 -rotate-45 shrink-0" />
            <span className="font-bold">{priceLabel}</span>
          </p>
          {isSoldOut ? (
            <span className="text-[15.83px] font-medium text-[#98A2B3] dark:text-[#667085]" aria-disabled>
              Sold out
            </span>
          ) : (
            <Link
              href={href}
              className="flex gap-1.5 items-center justify-start text-[15.83px] font-medium text-[#6917AF] dark:text-[#D7B5F5]"
              aria-label={`Get tickets for ${card.title}`}
            >
              <span>Get Ticket</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ZicketTrending() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateVisibility = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftChevron(scrollLeft > 0);
      setShowRightChevron(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateVisibility();
    window.addEventListener("resize", updateVisibility);
    return () => window.removeEventListener("resize", updateVisibility);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateVisibility);
      return () => container.removeEventListener("scroll", updateVisibility);
    }
  }, []);

  const scrollBy = (direction: "left" | "right") => {
    if (containerRef.current) {
      const container = containerRef.current;
      const card = container.children[0] as HTMLElement;
      const cardWidth = card.offsetWidth;
      const gap = 20;

      container.scrollBy({
        left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
        behavior: "smooth",
      });

      setTimeout(() => {
        const newIndex =
          direction === "right"
            ? Math.min(trendingEvents.length - 1, currentIndex + 1)
            : Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        updateVisibility();
      }, 300);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-black px-2 md:pl-30 py-15">
      <div className="flex justify-between items-center my-5 w-[88%]">
        <h1 className="text-[24px] md:text-2xl font-semibold text-[#2C0A4A] dark:text-[#D7B5F5]">
          Trending Now on Zicket
        </h1>

        <div className="flex gap-0.5 md:gap-2">
          <button
            className="px-3 py-2 rounded-full bg-white dark:bg-[#0D0D0D] border hover:bg-[#6917AF] hover:text-white border-[#6917AF] dark:border-[#D7B5F5] text-[#6917AF] dark:text-[#D7B5F5]"
            onClick={() => {
              scrollBy("left");
            }}
            disabled={!showLeftChevron}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="px-3 py-2 rounded-full border-gray-100 dark:border-0 border hover:border-[#6917AF] hover:bg-white bg-[#6917AF] text-white dark:bg-[#0D0D0D] hover:text-[#6917AF]"
            onClick={() => {
              scrollBy("right");
            }}
            disabled={!showRightChevron}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex justify-start items-center gap-5 max-w-full overflow-x-auto
                            pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {trendingEvents.map((card) => (
          <TrendingEventCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
