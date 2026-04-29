"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import EventCard from "./EventCard";
import Image from "next/image";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { dummyEvents } from "@/lib/dummyEvents/events";

const sliderEvents = dummyEvents.slice(0, 8).map((e) => ({
  eventId: e.id,
  image: e.image,
  title: e.title,
  date: e.date,
  time: e.time,
  location: e.location,
  price: e.isPaid ? `$${e.price.toFixed(2)}` : "Free",
}));

export default function EventSlider() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[32px] font-bold [color:var(--color-text-detail)] dark:text-[var(--color-text-main-dark)]">Explore Other Events</h3>
        <div className="flex gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer group"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous"
          >
            <span className="block group-hover:hidden">
              <Image src="/assets/icons/arrowLeftNormalIcon.svg" alt="Prev" width={43} height={43} className="dark:hidden" />
              <Image src="/assets/icons/arrowLeftNormalDarkIcon.svg" alt="Prev" width={43} height={43} className="hidden dark:block" />
            </span>
            <span className="hidden group-hover:block">
              <Image src="/assets/icons/arrowRightSelectedIcon.svg" alt="Prev Hover" width={43} height={43} style={{ transform: "rotate(180deg)" }} className="dark:hidden" />
              <Image src="/assets/icons/arrowRightSelectedDarkIcon.svg" alt="Prev Hover" width={43} height={43} style={{ transform: "rotate(180deg)" }} className="hidden dark:block" />
            </span>
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer group"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next"
          >
            <span className="block group-hover:hidden" style={{ transform: "rotate(180deg)" }}>
              <Image src="/assets/icons/arrowLeftNormalIcon.svg" alt="Next" width={43} height={43} className="dark:hidden" />
              <Image src="/assets/icons/arrowLeftNormalDarkIcon.svg" alt="Next" width={43} height={43} className="hidden dark:block" />
            </span>
            <span className="hidden group-hover:block">
              <Image src="/assets/icons/arrowRightSelectedIcon.svg" alt="Next Hover" width={43} height={43} className="dark:hidden" />
              <Image src="/assets/icons/arrowRightSelectedDarkIcon.svg" alt="Next Hover" width={43} height={43} className="hidden dark:block" />
            </span>
          </button>
        </div>
      </div>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={24}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
          1280: { slidesPerView: 4.2 },
        }}
      >
        {sliderEvents.map((event, i) => (
          <SwiperSlide key={event.eventId ?? i}>
            <EventCard {...event} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
