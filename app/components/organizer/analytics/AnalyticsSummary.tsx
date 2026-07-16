"use client";
import AnalyticsDropDown from "./AnalyticsDropDown";
import { useState } from "react";
import { AnalyticsIcon } from "@/public/svg/svg";
import AnalyticsCard from "./AnalyticsCard";

const dateOptions = [
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
        value: "3",
        percentage: "+4.9%",
    },
    {
        title: "Verified Attendees",
        value: "124",
        percentage: "+213",
    },
    {
        title: "Total Earnings",
        value: "$15,432",
        percentage: "+4.9%",
    },
    {
        title: "Anonymous RSVPs",
        value: "172",
        percentage: "+4.9%",
    },
];

export function AnalyticsSummary() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("Today");

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const dropDownItems = dateOptions.map((item) => ({
        content: item,
        onClick: () => {
            setSelectedDate(item);
            setIsDropdownOpen(false);
        },
    }));

    return (
        <section className="max-w-[1200px] mx-auto my-4 px-4 lg:px-0">
            <div className="flex flex-col items-start p-0 w-full bg-white dark:bg-[#121212] border-[0.8px] border-[#E3E3E3] dark:border-[#2C2C2C] rounded-xl overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-row items-center p-4 gap-3 w-full h-16 self-stretch border-b-[0.5px] border-[#E3E3E3] dark:border-[#2C2C2C]">
                    <div className="flex-none order-0 w-8 h-8 bg-[#E5E7EB] dark:bg-[#d9cfcf] border-[0.83px] border-[#E3E3E3] dark:border-[#2C2C2C] rounded-full flex items-center justify-center">
                        <AnalyticsIcon />
                    </div>
                    <h1 className="flex-grow order-1 font-inter font-medium text-base leading-[19px] text-[#1E1E1E] dark:text-white">
                        Analytics
                    </h1>
                    <div className="flex-none order-2">
                        <AnalyticsDropDown
                            isOpen={isDropdownOpen}
                            onToggle={toggleDropdown}
                            items={dropDownItems}
                            placeHolder={selectedDate}
                            // Custom styling for the dropdown trigger to match Figma's rounded pill shape
                            className="!rounded-full !px-4 !py-2 !text-xs !bg-transparent !border-[#E3E3E3] dark:!border-[#2C2C2C] dark:!text-white"
                        />
                    </div>
                </div>

                {/* Metrics Grid Section */}
                <div className="flex flex-col sm:flex-row items-center p-4 gap-4 w-full self-stretch overflow-x-auto lg:overflow-x-visible">
                    {dummyAnalytics.map((data, index) => (
                        <AnalyticsCard key={index} {...data} />
                    ))}
                </div>
            </div>
        </section>
    );
}