"use client";
import { FC, useEffect, useState } from "react";
import DropDown from "../../DropDown";
import {
  DangerIcon,
  KeyIcon,
  LockIcon,
  MailSecureIcon,
  MinusIcon,
  PasswordProtectedShield,
  PlusIcon,
  ShiedIcon,
} from "@/public/svg/svg";
import { TicketType } from "@/lib/dummyEvents/events";
import { Check } from "lucide-react";

interface TicketInfoProps {
  ticketTypes: TicketType[];
  slotsLeft: number;
  privacyLevel: string[];
  isPaid: boolean;
}
export const TicketInfo: FC<TicketInfoProps> = ({
  ticketTypes,
  slotsLeft,
  privacyLevel,
  isPaid,
}) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>(
    ticketTypes[0].name
  );
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
        setSelectedTicket(ticket.name);
      },
    };
  });

  return (
    <div className="p-8 border border-[#E9E9E9] rounded-xl space-y-6 dark:border-[#232323] w-full ">
      <p className="text-2xl font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
        Ticket Info
      </p>
      <hr className="w-full h-0.5" />
      <form className="space-y-10">
        <div>
          {ticketTypes.map((ticket, index) => {
            const isSelected = selectedTicket === ticket.name;
            return (
              <div
                key={ticket.name + index}
                className="space-y-3 mb-6 last:mb-0"
              >
                <label
                  htmlFor={ticket.name}
                  className={`cursor-pointer flex px-6 py-4 border rounded-xl justify-between items-center transition-colors ease-in-out duration-300  ${
                    isSelected ? "border-[#6917AF]" : "border-[#E4E5E6]"
                  }`}
                >
                  <p
                    className={`font-semibold text-base transition-colors ease-in-out duration-300 ${
                      isSelected ? "text-[#6917AF] " : ""
                    }`}
                  >
                    {" "}
                    {ticket.name}
                  </p>
                  <div className="relative size-5">
                    <input
                      type="radio"
                      name="ticketType"
                      id={ticket.name}
                      className="appearance-none border-[#E4E5E6] size-5 rounded-sm transition-colors ease-in-out duration-300 checked:bg-[#6917AF] border-[1.5px] "
                      onChange={() => setSelectedTicket(ticket.name)}
                      checked={isSelected}
                    />
                    <Check
                      size={16}
                      className="absolute top-1/2 left-1/2 text-white -translate-1/2 transition-colors ease-in-out duration-300"
                    />
                  </div>
                </label>
              </div>
            );
          })}
        </div>
        <div className="flex gap-6 flex-col">
          <label htmlFor="" className="text-[#7D7D7D] font-medium">
            Quantity
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
                    : "text-[#6917AF] dark:text-[#6917AF] cursor-pointer"
                }`}
              >
                <MinusIcon />
              </button>
              <p className="text-xl font-semibold text-[#6917AF] dark:text-[#6917AF]">
                {quantity}
              </p>
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity === availableTickets ? true : false}
                className={`${
                  quantity === availableTickets
                    ? "text-[#667185] dark:text-[#667185] cursor-not-allowed"
                    : "text-[#6917AF] dark:text-[#6917AF] cursor-pointer"
                }`}
              >
                <PlusIcon />
              </button>
            </div>
            <div>
              <p className="text-[#667185] text-sm font-normal">
                Only{" "}
                <span className="font-semibold dark:text-[#6917AF] text-[#6917AF]">
                  {availableTickets} Slots
                </span>{" "}
                Left!
              </p>
              <p className="text-sm  text-[#667185]">Don’t miss it</p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <p className="font-medium text-[#7D7D7D]">Privacy Level:</p>
          <div className="flex gap-4 flex-wrap">
            {privacyLevel.map((level, index) => (
              <div className="flex gap-1 border-[0.5px] rounded-lg border-[#E9E9E9] px-3 py-1.5 items-center">
                {level === "Wallet Required" ? (
                  <KeyIcon />
                ) : level === "Verified Access" ? (
                  <LockIcon />
                ) : (
                  <ShiedIcon />
                )}
                <p className="text-[#5C6170] text-xs font-medium">{level}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          role="form"
          className="bg-[#F4F4F4] p-5 flex flex-col w-full gap-y-5 rounded-[12px]"
        >
          <label
            htmlFor=""
            aria-label="Want a reminder? (Optional)"
            className="text-[#7D7D7D] font-medium"
          >
            Want a reminder? (Optional)
          </label>
          <div className="relative w-full">
            <input
              aria-label="email address"
              type="text"
              placeholder="Email address"
              className="block p-4 pr-10 truncate rounded-[12px] border border-[#606163] outline-0 placeholder:text-[#98A2B3] text-[#606163] w-full"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <MailSecureIcon />
            </div>
          </div>
        </div>

        <div className="bg-[#F2FFF2] dark:bg-[#131313] dark:text-[#0BD330] text-[#0ABA2A] py-3 px-5 gap-4 flex ">
          <DangerIcon />
          <p className="text-xs font-medium">Secure & Instant Payment</p>
        </div>
        <div>
          <button className="py-4 px-6 bg-[#6917AF] text-[#FCFDFD] flex w-full items-center justify-center font-bold rounded-full gap-3 cursor-pointer hover:bg-[#6917AF]/95 duration-200 ease-in-out transition dark:bg-[#751AC6] dark:text-[#0F0F0F] dark:hover:bg-[#751AC6]/95">
            <PasswordProtectedShield />
            <span>
              {isPaid ? "Connect Wallet to Purchase" : "Attend Anonymously"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
