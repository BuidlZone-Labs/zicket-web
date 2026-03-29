"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import EventCard from "./EventCard";
import Image from "next/image";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

const eventData = [
  {
    image: "/assets/slider/1.jpg",
    title: "Taipei City Idol Expo",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/2.jpg",
    title: "Solana Summer Game (Hackathon)",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/3.jpg",
    title: "Open De France 3x3",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/4.jpg",
    title: "Hellow Festival",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/5.jpg",
    title: "Zicket Caption",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/6.jpg",
    title: "Crypto Gala Night",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/7.jpg",
    title: "Web3 Summit",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
  {
    image: "/assets/slider/8.jpg",
    title: "NFT Art Expo",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "London, UK",
    price: "$100.00",
  },
];

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
        onSwiper={swiper => (swiperRef.current = swiper)}
        spaceBetween={24}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
          1280: { slidesPerView: 4.2 },
        }}
      >
        {eventData.map((event, i) => (
          <SwiperSlide key={i}>
            <EventCard {...event} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 