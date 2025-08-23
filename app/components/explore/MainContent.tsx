"use client";

import { useState, useEffect } from "react";
import Card from "./card";
import { EmptyStateIcon } from "@/public/svg/svg";
import CustomDropdown from "./CustomDropdown";
import { dummyEvents } from "@/lib/dummyEvents/events";
import SkeletonCard from "./SkeletonCard";
import type { EventType } from "@/lib/dummyEvents/events";

function MainContent() {
  const [events] = useState(dummyEvents);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );
  const [showCount, setShowCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobilePrivacy, setMobilePrivacy] = useState<string | null>(
    selectedPrivacy
  );
  const [mobilePrice, setMobilePrice] = useState<string | null>(selectedPrice);
  const [mobileDate, setMobileDate] = useState<string | null>(selectedDate);
  const [mobileEventType, setMobileEventType] = useState<EventType | null>(
    selectedEventType
  );
  const [mobileLocation, setMobileLocation] = useState<string | null>(
    selectedLocation
  );

  const privacyOptions = ["Anonymous", "Verified Access", "Wallet Required"];
  const priceOptions = ["Free Events Only", "Paid Events Only"];
  const locationOptions = [
    { content: "All", onClick: () => setSelectedLocation(null) },
    ...Array.from(new Set(events.map((event) => event.location))).map(
      (location) => ({
        content: location,
        onClick: () => setSelectedLocation(location),
      })
    ),
  ];
  const dateOptions = ["Today", "This Week", "This Month"];
  const eventTypeOptions: EventType[] = [
    "Music",
    "Tech & Web3",
    "Art & Culture",
    "Business",
    "Health & Wellness",
    "Education",
    "Community",
  ];

  const filterConfigs = [
    {
      key: "privacy",
      label: "Privacy Levels",
      options: privacyOptions,
      value: selectedPrivacy,
      showAllLabel: "Show All",
      setValue: setSelectedPrivacy as (val: string | null) => void,
    },
    {
      key: "price",
      label: "Pricing",
      options: priceOptions,
      value: selectedPrice,
      showAllLabel: "All Events",
      setValue: setSelectedPrice as (val: string | null) => void,
    },
    {
      key: "location",
      label: "Location",
      options: locationOptions.slice(1).map((opt) => opt.content),
      value: selectedLocation,
      setValue: setSelectedLocation as (val: string | null) => void,
    },
    {
      key: "date",
      label: "Date Range",
      options: dateOptions,
      value: selectedDate,
      setValue: setSelectedDate as (val: string | null) => void,
    },
    {
      key: "eventType",
      label: "Category",
      options: eventTypeOptions,
      value: selectedEventType,
      showAllLabel: "All Category",
      setValue: (val: string | null) => {
        if (val && eventTypeOptions.includes(val as EventType)) {
          setSelectedEventType(val as EventType);
        } else {
          setSelectedEventType(null);
        }
      },
    },
  ];

  const sortOptions = ["Popular", "Date", "Name", "Price"];
  const [selectedSort, setSelectedSort] = useState<string>(sortOptions[0]);
  const filteredEvents = events.filter((event) => {
    const matchLocation =
      !selectedLocation || event.location === selectedLocation;
    const matchPrice =
      !selectedPrice ||
      (selectedPrice === "Free Events Only" && event.price === 0) ||
      (selectedPrice === "Paid Events Only" && event.price > 0);
    let matchDate = true;
    if (selectedDate === "Today") {
      const eventDate = new Date(event.date);
      const today = new Date();
      matchDate =
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear();
    } else if (selectedDate === "This Week") {
      const eventDate = new Date(event.date);
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const lastDayOfWeek = new Date(today);
      lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday
      matchDate = eventDate >= firstDayOfWeek && eventDate <= lastDayOfWeek;
    } else if (selectedDate === "This Month") {
      const eventDate = new Date(event.date);
      const today = new Date();
      matchDate =
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear();
    } else if (selectedDate) {
      matchDate = event.date === selectedDate;
    }
    const matchType =
      !selectedEventType ||
      (event.type &&
        selectedEventType &&
        event.type.toString().trim().toLowerCase() ===
          selectedEventType.toString().trim().toLowerCase());
    const matchPrivacy =
      !selectedPrivacy || event.privacyLevel === selectedPrivacy;
    return (
      matchLocation && matchPrice && matchDate && matchType && matchPrivacy
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (selectedSort) {
      case "Date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "Name":
        return a.title.localeCompare(b.title);
      case "Price":
        return a.price - b.price;
      case "Popular":
      default:
        return 0; // keep original order for now
    }
  });

  const handleShowMore = () => {
    setShowCount((prev) => prev + 8);
  };
  const handleShowLess = () => {
    setShowCount(8);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleMobileApply = () => {
    setSelectedPrivacy(mobilePrivacy);
    setSelectedPrice(mobilePrice);
    setSelectedDate(mobileDate);
    setSelectedEventType(mobileEventType);
    setSelectedLocation(mobileLocation);
    setDrawerOpen(false);
  };
  const handleMobileClear = () => {
    setMobilePrivacy(null);
    setMobilePrice(null);
    setMobileDate(null);
    setMobileEventType(null);
    setMobileLocation(null);
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [
    selectedPrivacy,
    selectedPrice,
    selectedLocation,
    selectedDate,
    selectedEventType,
    showCount,
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="hidden sm:flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 border-t border-b border-t-[#F0F2F5] border-b-[#F0F2F5] py-2">
        <div className="flex flex-wrap items-center gap-2 text-sm w-full md:w-auto">
          <span className="font-medium text-[#7C3AED] mr-1">Filters:</span>
          {filterConfigs.map((f) => (
            <CustomDropdown
              key={f.key}
              label={f.label}
              options={f.options}
              value={f.value}
              onChange={f.setValue}
              showAllLabel={f.showAllLabel}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <span className="text-sm text-[#6B7280]">Sort by:</span>
          <CustomDropdown
            label={selectedSort}
            options={["Popular", "Date", "Name", "Price"]}
            value={selectedSort}
            onChange={(val) => val && setSelectedSort(val)}
          />
        </div>
      </div>
      <div className="flex sm:hidden items-center justify-between mb-4">
        <span className="font-bold text-lg text-[#2C0A4A]">Filter by:</span>
        <button
          className="rounded-full"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="17" stroke="#181F36" strokeWidth="3" />
            <rect
              x="12"
              y="15"
              width="16"
              height="2.5"
              rx="1.25"
              fill="#181F36"
            />
            <rect
              x="14"
              y="20"
              width="12"
              height="2.5"
              rx="1.25"
              fill="#181F36"
            />
            <rect
              x="16"
              y="25"
              width="8"
              height="2.5"
              rx="1.25"
              fill="#181F36"
            />
          </svg>
        </button>
      </div>
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-11/12 max-w-xs bg-white shadow-lg p-6 flex flex-col z-50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg text-[#2C0A4A]">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#2C0A4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#2C0A4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0">
              {filterConfigs.map((f) => (
                <div key={f.key}>
                  <CustomDropdown
                    label={f.label}
                    options={f.options}
                    value={
                      f.key === "privacy"
                        ? mobilePrivacy
                        : f.key === "price"
                        ? mobilePrice
                        : f.key === "location"
                        ? mobileLocation
                        : f.key === "date"
                        ? mobileDate
                        : f.key === "eventType"
                        ? mobileEventType
                        : ""
                    }
                    onChange={
                      f.key === "privacy"
                        ? setMobilePrivacy
                        : f.key === "price"
                        ? setMobilePrice
                        : f.key === "location"
                        ? setMobileLocation
                        : f.key === "date"
                        ? setMobileDate
                        : f.key === "eventType"
                        ? (val: string | null) => {
                            if (
                              val &&
                              eventTypeOptions.includes(val as EventType)
                            ) {
                              setMobileEventType(val as EventType);
                            } else {
                              setMobileEventType(null);
                            }
                          }
                        : () => {}
                    }
                    fullWidthOptions
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6 pt-4 bg-white sticky bottom-0 left-0 right-0">
              <button
                className="flex-1 py-2 rounded bg-[#7C3AED] text-white font-bold"
                onClick={handleMobileApply}
              >
                Apply
              </button>
              <button
                className="flex-1 py-2 rounded border border-[#7C3AED] text-[#7C3AED] font-bold"
                onClick={handleMobileClear}
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
      <div className="hidden sm:flex flex-wrap items-center justify-between gap-2 mb-4 mt-1 w-full min-h-[32px]">
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {filterConfigs.map(
            (f) =>
              f.value && (
                <span
                  key={f.key}
                  className="gap-2 justify-between align-center px-2 rounded-[8px] border border-[#7C3AED] text-[#6B7280] bg-white flex items-center text-base font-semibold h-7"
                >
                  {f.value}
                  <button
                    className="text-[#6B7280] text-2xl flex items-center justify-center w-2 h-7 mb-1 rounded-full cursor-pointer"
                    style={{ lineHeight: 1 }}
                    onClick={() => f.setValue(null)}
                    aria-label="Remove filter"
                  >
                    ×
                  </button>
                </span>
              )
          )}
          {filterConfigs.every((f) => !f.value) && (
            <span className="invisible h-7 px-3">placeholder</span>
          )}
        </div>
        <div className="text-xs text-[#6B7280] ml-auto">
          Showing 1 - {Math.min(showCount, filteredEvents.length)} of{" "}
          {filteredEvents.length} results
        </div>
      </div>
      {loading ? (
        <div className="space-y-10">
          <div className="grid-cols-1 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
            {Array.from({
              length: Math.min(showCount, filteredEvents.length || 8),
            }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <EmptyStateIcon />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            No events found
          </p>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            Try adjusting your filters or check back later for new events.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid-cols-1 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
            {sortedEvents.slice(0, showCount).map((event, index) => (
              <Card key={index} {...event} />
            ))}
          </div>
          <div className="flex items-center justify-center relative mt-8">
            <button
              onClick={
                filteredEvents.length > showCount
                  ? handleShowMore
                  : handleShowLess
              }
              className="text-xs py-2 pl-4 pr-3 space-x-2 text-[#1E1E1E] bg-[#F6F6F6] hover:bg-[#F6F6F6]/10 rounded-full font-bold flex items-center cursor-pointer"
            >
              <span>
                {filteredEvents.length > showCount ? "Show more" : "Show less"}
              </span>
            </button>
            <button
              onClick={scrollToTop}
              className="absolute right-0 bg-[#F6F6F6] hover:bg-[#F6F6F6]/10 rotate-270 transform p-3 rounded-full cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 15L12 10L7 5"
                  stroke="#1E1E1E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContent;
