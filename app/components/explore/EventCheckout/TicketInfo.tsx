"use client";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DropDown from "../../DropDown";
import {
  DangerIcon,
  MinusIcon,
  PasswordProtectedShield,
  PlusIcon,
} from "@/public/svg/svg";
// const ticketTypes = [
//   {
//     id: "vip",
//     name: "VIP",
//     description:
//       "Front-row seats, exclusive access, and complimentary refreshments.",
//     price: 150,
//     perks: ["Front Row", "Lounge Access", "Free Drinks"],
//   },
//   {
//     id: "regular",
//     name: "Regular",
//     description: "General admission with access to all standard event areas.",
//     price: 75,
//     perks: ["Standard Seating", "Main Hall Access"],
//   },
//   {
//     id: "student",
//     name: "Student",
//     description: "Discounted ticket for students with valid ID.",
//     price: 40,
//     perks: ["Standard Seating", "Student Lounge"],
//   },
//   {
//     id: "group",
//     name: "Group",
//     description: "Discounted tickets for groups of 5 or more.",
//     price: 60,
//     perks: ["Group Discount", "Reserved Group Area"],
//   },
// ];
interface TicketInfoProps {
  ticketTypes: string[];
  slotsLeft: number;
  title: string;
}
export const TicketInfo: FC<TicketInfoProps> = ({
  ticketTypes,
  slotsLeft,
  title,
}) => {
  const router = useRouter();

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [availableTickets, setAvailableTickets] = useState(slotsLeft);
  const [quantity, setQuantity] = useState(1);
  const handleDropDownToggle = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };
  const incrementQuantity = () => {
    if (quantity < availableTickets) {
      setQuantity((prev) => prev + 1);
    }
  };
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const tickets = ticketTypes.map((ticket) => {
    return {
      content: ticket,
      onClick: () => {
        setSelectedTicket(ticket);
      },
    };
  });

  const handleNavigation = (eventId: string) => {
    const path = `/explore/${eventId}/ticket`.replaceAll(" ", "-");
    router.push(path);
  };

  return (
    <div className="p-8 border border-[#E9E9E9] rounded-xl space-y-6 dark:border-[#232323] w-full ">
      <p className="text-2xl font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
        Ticket Info
      </p>
      <hr className="w-full h-0.5" />
      <form className="space-y-10">
        <div className="flex gap-6 flex-col">
          <label htmlFor="" className="text-[#7D7D7D] font-medium">
            Select Ticket Type
          </label>
          <DropDown
            isOpen={isDropDownOpen}
            onToggle={handleDropDownToggle}
            items={tickets}
            placeHolder="Choose Ticket"
            selectedItem={selectedTicket}
          />
        </div>
        <div className="flex gap-6 flex-col">
          <label htmlFor="" className="text-[#7D7D7D] font-medium">
            Select Quantity
          </label>
          <div className="flex justify-between lg:items-center gap-6 flex-col lg:flex-row">
            <div className="flex py-5 px-6.5 bg-[#F9FAFB] border border-[#F0F2F5] dark:bg-[#121212] dark:border-[#191919] rounded-4xl w-fit gap-10 justify-between max-w-[12.8rem] min-w-[12.8rem]">
              <button
                disabled={quantity === 1 ? true : false}
                type="button"
                onClick={decrementQuantity}
                className={`${
                  quantity === 1
                    ? "text-[#667185] cursor-not-allowed"
                    : "text-[#2C0A4A] dark:text-[#D7B5F5] cursor-pointer"
                }`}
              >
                <MinusIcon />
              </button>
              <p className="text-xl font-semibold text-[#2C0A4A] dark:text-[#D7B5F5]">
                {quantity}
              </p>
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity === availableTickets ? true : false}
                className={`${
                  quantity === availableTickets
                    ? "text-[#667185] dark:text-[#667185] cursor-not-allowed"
                    : "text-[#2C0A4A] dark:text-[#D7B5F5] cursor-pointer"
                }`}
              >
                <PlusIcon />
              </button>
            </div>
            <div>
              <p className="text-[#667185] text-sm font-normal">
                Only{" "}
                <span className="font-semibold dark:text-[#2C0A4A] text-[#2C0A4A]">
                  {availableTickets} Slots
                </span>{" "}
                Left!
              </p>
              <p className="text-sm font-semibold text-[#667185]">
                Don’t miss it
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#F2FFF2] dark:bg-[#131313] dark:text-[#0BD330] text-[#0ABA2A] py-3 px-5 gap-4 flex ">
          <DangerIcon />
          <p className="text-xs font-medium">Secure & Instant Payment</p>
        </div>
        <div>
          <button
            onClick={() => handleNavigation(title)}
            type="button"
            className="py-4 px-6 bg-[#6917AF] text-[#FCFDFD] flex w-full items-center justify-center font-bold rounded-full gap-3 cursor-pointer hover:bg-[#6917AF]/95 duration-200 ease-in-out transition dark:bg-[#751AC6] dark:text-[#0F0F0F] dark:hover:bg-[#751AC6]/95"
          >
            <PasswordProtectedShield />
            <span>Get Your Pass</span>
          </button>
        </div>
      </form>
    </div>
  );
};
