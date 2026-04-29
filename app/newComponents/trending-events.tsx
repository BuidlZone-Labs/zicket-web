"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  MapPin,
  Calendar,
  Timer,
  ChevronRight,
  ChevronLeft,
  Ticket,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TrendingEvents() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef(null);

  const events = [
    {
      title: "Taipei City Idol Expo",
      tag: "Anonymous",
      date: "Jun. 04 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "London, UK",
      image: "/Rectangle 3.svg?height=200&width=300",
    },
    {
      title: "Solana Summer Game (Hack...",
      tag: "Verified Access",
      date: "Jun. 04 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "London, UK",
      image: "/Rectangle 3 (1).svg?height=200&width=300",
    },
    {
      title: "Open De france 3x3",
      tag: "Wallet-Required",
      date: "Jun. 04 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "London, UK",
      image: "/Rectangle 3 (2).svg?height=200&width=300",
    },
    {
      title: "Hellow Festival 2020 CDMX",
      tag: "Wallet-Required",
      date: "Jun. 04 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "London, UK",
      image: "/Rectangle 3 (3).svg?height=200&width=300",
    },
    // {
    //   title: "Virtual Reality Expo 2024",
    //   tag: "Wallet-Required",
    //   date: "Jun. 04 2025",
    //   time: "4:00 pm (UTC +01:00)",
    //   location: "London, UK",
    //   image: "/Rectangle 3 (4).svg?height=200&width=300",
    // },
    // {
    //   title: "Tech Conference 2025",
    //   tag: "Anonymous",
    //   date: "Jun. 04 2025",
    //   time: "4:00 pm (UTC +01:00)",
    //   location: "London, UK",
    //   image: "/Rectangle 3.svg?height=200&width=300",
    // },
  ];

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3); // Desktop: 3 items
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(1); // Mobile: 1 item
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Reset current index when items per view changes
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentIndex((prev) => {
        const maxIdx = Math.max(0, events.length - itemsPerView);
        return prev > maxIdx ? maxIdx : prev;
      });
    });
  }, [itemsPerView, events.length]);

  const maxIndex = Math.max(0, events.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-8 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] text-[#2C0A4A] font-bold">
            Trending Now on Zicket
          </h2>
          <button className="bg-none border-b border-[#2C0A4A] text-sm sm:text-base font-bold text-[#2C0A4A] flex items-center hover:opacity-80 transition-opacity">
            Browse Events{" "}
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#2C0A4A]" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === maxIndex}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#2C0A4A]" />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden mx-6 sm:mx-8 lg:mx-12">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView)
                }%)`,
              }}
            >
              {events.map((event, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 px-2 sm:px-3 ${
                    itemsPerView === 1
                      ? "w-full"
                      : itemsPerView === 2
                      ? "w-1/2"
                      : "w-1/3"
                  }`}
                >
                  <Card className="p-1 border border-[#E9E9E9] overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        width={300}
                        height={200}
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-40 sm:h-48 lg:h-52 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-white text-black text-xs">
                        {event.tag}
                      </Badge>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-bold text-sm sm:text-base mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-col border-b border-[#E9E9E9] text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2 pb-3">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {event.date} attending
                          </span>
                        </span>
                        <span className="flex items-center">
                          <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{event.time}</span>
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 sm:mt-4 text-[#5C6170]">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                          <p className="text-sm sm:text-base">Free</p>
                        </div>
                        <button className="flex text-[#2C0A4A] text-xs sm:text-sm cursor-pointer items-center gap-1 font-bold hover:opacity-80 transition-opacity">
                          Get Ticket
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {maxIndex > 0 && (
            <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-[#2C0A4A]"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
