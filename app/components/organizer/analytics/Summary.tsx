"use client";
import DropDown from "@/app/components/DropDown";
import { useState } from "react";
import Card from "./card";
import { AnalyticsIcon } from "@/public/svg/svg";

const date = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Last 6 months",
  "Last 1 year",
  "Custom Range",
];

const dummyAnalytics = [
  {
    title: "Live Events",
    value: 0,
    percentage: "0%",
  },
  {
    title: "Verified Attendees",
    value: 0,
    percentage: "0",
  },
  {
    title: "Total Earnings",
    value: 0,
    percentage: "0%",
  },
  {
    title: "Anonymous RSVPs",
    value: 0,
    percentage: "0%",
  },
];

function Summary() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const dropDownItems = date.map((item) => ({
    content: item,
    onClick: () => {
      setSelectedDate(item);
      setIsDropdownOpen(false);
    },
  }));
  return (
    <section className="max-w-[1200px] m-auto  my-4 px-4 lg:px-0">
      <div className="border border-[#E3E3E3] rounded-[12px] ">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E5E7EB] rounded-full w-8 h-8 flex items-center justify-center border border-[#E5E7EB]">
              <AnalyticsIcon />
            </div>
            <p className="text-base font-medium text-dark-gray">Analytics</p>
          </div>

          <div>
            <DropDown
              isOpen={isDropdownOpen}
              onToggle={toggleDropdown}
              items={dropDownItems}
              placeHolder={selectedDate}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {dummyAnalytics.map((data, index) => (
            <Card key={index} {...data} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Summary;
