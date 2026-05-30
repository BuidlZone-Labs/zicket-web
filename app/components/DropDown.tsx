"use client";
import { ArrowRightIcon } from "@/public/svg/svg";
import { useId } from "react";
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
  const menuId = useId();
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className="pl-6 p-3 border border-[#2C0A4A] dark:border-[#D7B5F5] rounded-full cursor-pointer w-full gap-2 text-[#2C0A4A] dark:text-[#D7B5F5] text-sm font-medium flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2"
      >
        <span className="select-none truncate">
          {selectedItem ? selectedItem : placeHolder}
        </span>

        <span
          className={`${isOpen ? "rotate-270" : "rotate-85"
            } transition ease-in-out duration-150`}
        >
          <ArrowRightIcon />
        </span>
      </button>
      {isOpen && (
        <div id={menuId} className="absolute left-0 top-full mt-2 rounded-sm bg-white dark:bg-[#D7B5F5] shadow w-full shadow-[#ae78dd9e] z-20">
          <ul role="menu">
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  role="menuitem"
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
