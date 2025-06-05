"use client";
import { useState } from "react";
import Card from "./card";
import { ArrowRightIcon, EmptyStateIcon } from "@/public/svg/svg";
import DropDown from "../DropDown";

function MainContent() {
  const [events] = useState([
    {
      title: "Solana Summer Hackathon",
      date: "Jun. 02 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "Ghana",
      price: "$100.00",
      type: "Hackathon",
      privacy: "Public",
    },
    {
      title: "Taipei City Idol Expo",
      date: "Jun. 04 2025",
      time: "4:00 pm (UTC +01:00)",
      location: "London, UK",
      price: "$10.00",
      type: "Expo",
      privacy: "Private",
    },
    {
      title: "Web3 Community Meetup",
      date: "Jun. 10 2025",
      time: "6:00 pm (UTC +01:00)",
      location: "Berlin, Germany",
      price: "$0.00",
      type: "Meetup",
      privacy: "Public",
    },
    {
      title: "NFT Art Fair",
      date: "Jun. 12 2025",
      time: "2:00 pm (UTC +01:00)",
      location: "New York, USA",
      price: "$50.00",
      type: "Expo",
      privacy: "Private",
    },
    {
      title: "DeFi Summit",
      date: "Jun. 15 2025",
      time: "10:00 am (UTC +01:00)",
      location: "London, UK",
      price: "$200.00",
      type: "Conference",
      privacy: "Public",
    },
    {
      title: "Crypto Gala Night",
      date: "Jun. 18 2025",
      time: "8:00 pm (UTC +01:00)",
      location: "Paris, France",
      price: "$150.00",
      type: "Gala",
      privacy: "Private",
    },
    {
      title: "Blockchain for Good",
      date: "Jun. 20 2025",
      time: "3:00 pm (UTC +01:00)",
      location: "Accra, Ghana",
      price: "$20.00",
      type: "Seminar",
      privacy: "Public",
    },
    {
      title: "DAO Builders Workshop",
      date: "Jun. 22 2025",
      time: "1:00 pm (UTC +01:00)",
      location: "Berlin, Germany",
      price: "$75.00",
      type: "Workshop",
      privacy: "Private",
    },
    {
      title: "Metaverse Fashion Week",
      date: "Jun. 25 2025",
      time: "5:00 pm (UTC +01:00)",
      location: "Milan, Italy",
      price: "$120.00",
      type: "Expo",
      privacy: "Public",
    },
    {
      title: "Smart Contract Bootcamp",
      date: "Jun. 28 2025",
      time: "11:00 am (UTC +01:00)",
      location: "San Francisco, USA",
      price: "$300.00",
      type: "Workshop",
      privacy: "Private",
    },
    {
      title: "Women in Crypto Summit",
      date: "Jul. 01 2025",
      time: "9:00 am (UTC +01:00)",
      location: "Lagos, Nigeria",
      price: "$80.00",
      type: "Conference",
      privacy: "Public",
    },
    {
      title: "Gaming on Blockchain",
      date: "Jul. 03 2025",
      time: "7:00 pm (UTC +01:00)",
      location: "Tokyo, Japan",
      price: "$60.00",
      type: "Seminar",
      privacy: "Private",
    },
  ]);
  const [IsLocationOpen, setIsLocationOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showCount, setShowCount] = useState(8);
  const [isFilterSidePenal, SetIsFilterSidePenal] = useState(false);
  // Filtering logic
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(
    null
  );
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(null);

  // Unique locations
  const locations = Array.from(new Set(events.map((event) => event.location)));
  const locationOptions = [
    { content: "All", onClick: () => setSelectedLocation(null) },
    ...locations.map((location) => ({
      content: location,
      onClick: () => setSelectedLocation(location),
    })),
  ];

  // Unique prices (sorted ascending)
  const prices = Array.from(new Set(events.map((event) => event.price))).sort(
    (a, b) => parseFloat(a.replace("$", "")) - parseFloat(b.replace("$", ""))
  );
  const priceOptions = [
    { content: "All", onClick: () => setSelectedPrice(null) },
    ...prices.map((price) => ({
      content: price,
      onClick: () => setSelectedPrice(price),
    })),
  ];

  // Unique dates (sorted ascending)
  const dates = Array.from(new Set(events.map((event) => event.date))).sort();
  const dateOptions = [
    { content: "All", onClick: () => setSelectedDate(null) },
    ...dates.map((date) => ({
      content: date,
      onClick: () => setSelectedDate(date),
    })),
  ];

  // Unique event types
  const eventTypes = Array.from(new Set(events.map((event) => event.type)));
  const eventTypeOptions = [
    { content: "All", onClick: () => setSelectedEventType(null) },
    ...eventTypes.map((type) => ({
      content: type,
      onClick: () => setSelectedEventType(type),
    })),
  ];

  // Unique privacy options
  const privacies = Array.from(new Set(events.map((event) => event.privacy)));
  const privacyOptions = [
    { content: "All", onClick: () => setSelectedPrivacy(null) },
    ...privacies.map((privacy) => ({
      content: privacy,
      onClick: () => setSelectedPrivacy(privacy),
    })),
  ];

  // Filtered events
  const filteredEvents = events.filter((event) => {
    const matchLocation =
      !selectedLocation || event.location === selectedLocation;
    const matchPrice = !selectedPrice || event.price === selectedPrice;
    const matchDate = !selectedDate || event.date === selectedDate;
    const matchType = !selectedEventType || event.type === selectedEventType;
    const matchPrivacy = !selectedPrivacy || event.privacy === selectedPrivacy;
    return (
      matchLocation && matchPrice && matchDate && matchType && matchPrivacy
    );
  });

  // Show more function
  const handleShowMore = () => {
    setShowCount((prev) => prev + 8);
  };
  const handleShowLess = () => {
    setShowCount(8);
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="max-w-7xl mx-auto space-y-15 py-20 px-4">
      <div className="flex md:items-center justify-between  flex-col md:flex-row items-start gap-3">
        <div className="overflow-hidden"></div>
        <div className="flex items-center justify-between  w-full flex-row    gap-3 :flex-row">
          <div className="overflow-hidden">
            <p className="text-xl sm:text-2xl font-bold text-[#2C0A4A] dark:text-[#D7B5F5]">
              Filter by:
            </p>
          </div>
          {/* Desktop: Show dropdowns, Mobile: Show 4 dots that open dropdowns */}
          <div className="lg:flex gap-2.5 items-center hidden">
            <DropDown
              items={privacyOptions}
              isOpen={isPrivacyOpen}
              onToggle={() => setIsPrivacyOpen(!isPrivacyOpen)}
              placeHolder={selectedPrivacy ? selectedPrivacy : "Privacy"}
            />
            <DropDown
              items={locationOptions}
              isOpen={IsLocationOpen}
              onToggle={() => setIsLocationOpen(!IsLocationOpen)}
              placeHolder={selectedLocation ? selectedLocation : "Location"}
            />
            <DropDown
              items={eventTypeOptions}
              isOpen={isEventTypeOpen}
              onToggle={() => setIsEventTypeOpen(!isEventTypeOpen)}
              placeHolder={selectedEventType ? selectedEventType : "Event Type"}
            />
            <DropDown
              items={priceOptions}
              isOpen={isPriceOpen}
              onToggle={() => setIsPriceOpen(!isPriceOpen)}
              placeHolder={selectedPrice ? selectedPrice : "Price"}
            />
            <DropDown
              items={dateOptions}
              isOpen={isDateOpen}
              onToggle={() => setIsDateOpen(!isDateOpen)}
              placeHolder={selectedDate ? selectedDate : "Date"}
            />
          </div>
          {/* Mobile: 4 dots */}
          <div className="flex lg:hidden items-center">
            <button
              className="flex gap-1.5 items-center px-3 py-2 rounded-lg bg-[#F6F6F6] hover:bg-[#F6F6F6]/70 relative z-70"
              onClick={() => {
                setIsLocationOpen(false);
                setIsPriceOpen(false);
                setIsDateOpen(false);
                setIsEventTypeOpen(false);
                setIsPrivacyOpen(false);
                SetIsFilterSidePenal(!isFilterSidePenal);
              }}
              aria-label="Show filters"
            >
              <div className=" space-y-1">
                <span className="size-1.5 rounded-full bg-[#2C0A4A] block" />
                <span className="size-1.5 rounded-full bg-[#2C0A4A] block" />
              </div>
              <div className=" space-y-1">
                <span className="size-1.5 rounded-full bg-[#2C0A4A] block" />
                <span className="size-1.5 rounded-full bg-[#2C0A4A] block" />
              </div>
            </button>
            {/* Mobile dropdowns modal */}
            {(isFilterSidePenal ||
              isPriceOpen ||
              isDateOpen ||
              isEventTypeOpen ||
              isPrivacyOpen) && (
              <div className="absolute inset-0 z-50 py-4 mt-6 bg-opacity-40 bg-black/5 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-fit max-w-md space-y-4 relative">
                  {/* <button
                    className="absolute top-2 right-2 text-black hover:text-gray-800"
                    onClick={() => {
                      setIsLocationOpen(false);
                      setIsPriceOpen(false);
                      setIsDateOpen(false);
                      setIsEventTypeOpen(false);
                      setIsPrivacyOpen(false);
                      SetIsFilterSidePenal(false);
                    }}
                  ></button> */}
                  <DropDown
                    items={privacyOptions}
                    isOpen={isPrivacyOpen}
                    onToggle={() => setIsPrivacyOpen(!isPrivacyOpen)}
                    placeHolder={selectedPrivacy ? selectedPrivacy : "Privacy"}
                  />
                  <DropDown
                    items={locationOptions}
                    isOpen={IsLocationOpen}
                    onToggle={() => setIsLocationOpen(!IsLocationOpen)}
                    placeHolder={
                      selectedLocation ? selectedLocation : "Location"
                    }
                  />
                  <DropDown
                    items={eventTypeOptions}
                    isOpen={isEventTypeOpen}
                    onToggle={() => setIsEventTypeOpen(!isEventTypeOpen)}
                    placeHolder={
                      selectedEventType ? selectedEventType : "Event Type"
                    }
                  />

                  <DropDown
                    items={priceOptions}
                    isOpen={isPriceOpen}
                    onToggle={() => setIsPriceOpen(!isPriceOpen)}
                    placeHolder={selectedPrice ? selectedPrice : "Price"}
                  />
                  <DropDown
                    items={dateOptions}
                    isOpen={isDateOpen}
                    onToggle={() => setIsDateOpen(!isDateOpen)}
                    placeHolder={selectedDate ? selectedDate : "Date"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {filteredEvents.length === 0 ? (
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
        <div className="space-y-15">
          <div className="grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3  gap-6 ">
            {filteredEvents.slice(0, showCount).map((event, index) => (
              <Card key={index} {...event} />
            ))}
          </div>
          <div className="flex items-center justify-center relative">
            <button
              onClick={
                filteredEvents.length > showCount
                  ? handleShowMore
                  : handleShowLess
              }
              className="text-xs py-2 pl-4 pr-3 space-x-2 text-[#1E1E1E] bg-[#F6F6F6] hover:bg-[#F6F6F6]/10 rounded-full font-bold  flex  items-center cursor-pointer"
            >
              <span>
                {filteredEvents.length > showCount ? "Show more" : "Show less"}{" "}
              </span>{" "}
              <div
                className={`${
                  filteredEvents.length > showCount ? "rotate-90" : "rotate-270"
                } transform`}
              >
                <ArrowRightIcon />
              </div>
            </button>
            <button
              onClick={scrollToTop}
              className="absolute right-0 bg-[#F6F6F6] hover:bg-[#F6F6F6]/10 rotate-270 transform p-3 rounded-full cursor-pointer"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContent;
