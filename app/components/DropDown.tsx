"use client";
import { ArrowRightIcon } from "@/public/svg/svg";
import { useState } from "react";
interface DropDownProps {
  isOpen: boolean;
  onToggle: () => void;
  items: {
    content: React.ReactNode;
    onClick: () => void;
  }[];
  selectedItem?: string;
  placeHolder: string;
}

const DropDown: React.FC<DropDownProps> = ({
  isOpen,
  onToggle,
  items,
  placeHolder,
  selectedItem,
}) => {
  return (
    <div
      onClick={onToggle}
      className="relative pl-6 p-3 border border-[#2C0A4A] dark:border-[#D7B5F5] rounded-full cursor-pointer w-full"
    >
      <div className="gap-2 text-[#2C0A4A] dark:text-[#D7B5F5] text-sm font-medium flex items-center  justify-between">
        <span className="select-none truncate">
          {selectedItem ? selectedItem : placeHolder}
        </span>

        <span
          className={`${
            isOpen ? "rotate-270" : "rotate-85"
          } transition ease-in-out duration-150`}
        >
          <ArrowRightIcon />
        </span>
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 rounded-sm bg-white dark:bg-[#D7B5F5]  shadow w-full shadow-[#ae78dd9e] z-20">
          <ul>
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  className="text-[#2C0A4A] py-1.5 cursor-pointer hover:bg-[#2C0A4A]/10 w-full text-start px-2.5 text-sm font-medium"
                  onClick={item.onClick}
                >
                  {item.content}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDown;
