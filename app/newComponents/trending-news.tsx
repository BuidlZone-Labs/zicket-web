"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

export function TrendingNews() {
  const swiperRef = useRef<SwiperClass | null>(null);

  const articles = [
    {
      genre: "Tech",
      date: "03 June, 2025",
      title: "Zicket X Builders: A Hack Night Recap",
      subject: "How the dev crowd used Zicket for a private demo series.",
      author: "ZKC Node",
      avatar: "/images/avatar1.jpg",
      image: "/images/News1.jpg",
    },
    {
      genre: "Behind the Scenes",
      date: "03 June, 2025",
      title: "Designing for Private Discovery",
      subject: "Why our Interface hides what doesnt matter",
      author: "Studio Delta",
      avatar: "/images/avatar2.jpg",
      image: "/images/News2.jpg",
    },
    {
      genre: "Ecosystem",
      date: "03 June, 2025",
      title: "CircleDrop Format Explained",
      subject: "Smaller, faster events for high trust groups",
      author: "Indie Venue Club",
      avatar: "/images/avatar3.jpg",
      image: "/images/News-3.jpg",
    },
    {
      genre: "Community",
      date: "02 June, 2025",
      title: "Monthly Meetup Highlights",
      subject: "Key insights from our latest community gathering",
      author: "Community Team",
      avatar: "/images/avatar1.jpg",
      image: "/images/News2.jpg",
    },
    {
      genre: "Product",
      date: "01 June, 2025",
      title: "New Features This Month",
      subject: "Latest updates and improvements to the platform",
      author: "Product Team",
      avatar: "/images/avatar2.jpg",
      image: "/images/News1.jpg",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto py-8 lg:py-20">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-[#2C0A4A] dark:text-[#D7B5F5]">Trending News</h2>
          <div className="flex gap-2">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer group"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous"
            >
              <span className="block group-hover:hidden">
                <Image
                  src="/assets/icons/arrowLeftNormalIcon.svg"
                  alt="Prev"
                  width={43}
                  height={43}
                  className="dark:hidden"
                />
                <Image
                  src="/assets/icons/arrowLeftNormalDarkIcon.svg"
                  alt="Prev"
                  width={43}
                  height={43}
                  className="hidden dark:block"
                />
              </span>
              <span className="hidden group-hover:block">
                <Image
                  src="/assets/icons/arrowRightSelectedIcon.svg"
                  alt="Prev Hover"
                  width={43}
                  height={43}
                  style={{ transform: "rotate(180deg)" }}
                  className="dark:hidden"
                />
                <Image
                  src="/assets/icons/arrowRightSelectedDarkIcon.svg"
                  alt="Prev Hover"
                  width={43}
                  height={43}
                  style={{ transform: "rotate(180deg)" }}
                  className="hidden dark:block"
                />
              </span>
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer group"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next"
            >
              <span
                className="block group-hover:hidden"
                style={{ transform: "rotate(180deg)" }}
              >
                <Image
                  src="/assets/icons/arrowLeftNormalIcon.svg"
                  alt="Next"
                  width={43}
                  height={43}
                  className="dark:hidden"
                />
                <Image
                  src="/assets/icons/arrowLeftNormalDarkIcon.svg"
                  alt="Next"
                  width={43}
                  height={43}
                  className="hidden dark:block"
                />
              </span>
              <span className="hidden group-hover:block">
                <Image
                  src="/assets/icons/arrowRightSelectedIcon.svg"
                  alt="Next Hover"
                  width={43}
                  height={43}
                  className="dark:hidden"
                />
                <Image
                  src="/assets/icons/arrowRightSelectedDarkIcon.svg"
                  alt="Next Hover"
                  width={43}
                  height={43}
                  className="hidden dark:block"
                />
              </span>
            </button>
          </div>
        </div>

        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          breakpoints={{
            480: { slidesPerView: 1.2 },
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 2.5 },
            1280: { slidesPerView: 3.2 },
            1536: { slidesPerView: 3.5 },
          }}
        >
          {articles.map((article, index) => (
            <SwiperSlide key={index}>
              <Card className="w-full max-w-[380px] h-[380px] mx-auto p-0 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <div className="w-full h-48 overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    width={380}
                    height={192}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="flex-1 flex flex-col justify-between p-4">
                  <div className="flex flex-col gap-3">
                    <p className="text-[12px] text-[#5C6170]">
                      {article.genre} - {article.date}
                    </p>

                    <p className="font-semibold text-[14px] dark:text-[#D7B5F5] line-clamp-2">
                      {article.title}
                    </p>

                    <p className="text-[12px] text-[#5C6170] line-clamp-3 flex-1">
                      {article.subject}
                    </p>
                  </div>

                  <div className="flex items-center justify-normal gap-3 mt-4">
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <Image
                        src={article.avatar || "/placeholder.svg"}
                        fill
                        alt="My Avatar"
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-[14px] text-[#1E1E1E] dark:text-[#D7B5F5] truncate">
                      {article.author}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex justify-end mt-8">
          <button className="bg-none border-b border-[#2C0A4A] dark:border-[#D7B5F5] text-[16px] font-bold text-[#2C0A4A] dark:text-[#D7B5F5] flex">
            See All News <ArrowUpRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
