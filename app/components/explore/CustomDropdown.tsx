import React, { useState, useRef, useEffect, useId } from "react";
import { ArrowRightIcon } from "@/public/svg/svg";

interface CustomDropdownProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (val: string | null) => void;
  showAllLabel?: string;
  fullWidthOptions?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, options, value, onChange, showAllLabel = 'Show All', fullWidthOptions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const menuId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        id={buttonId}
        type="button"
        className={`flex items-center justify-between py-1 rounded transition-all select-none w-full ${value ? "text-[#7C3AED]" : "text-[#6B7280]"} cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        <span className="truncate text-left w-full">{label}</span>
        <span className={`ml-2 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} style={{ display: 'flex', alignItems: 'center', height: 18 }}>
          <ArrowRightIcon isActive={value ? true : false} />
        </span>
      </button>
      {open && (
        <div className={`absolute left-0 mt-1 bg-white border border-[#E5E7EB] rounded shadow z-10 ${fullWidthOptions ? 'w-full' : 'min-w-[180px]'}`}>
          <ul id={menuId} className="py-1" role="listbox" aria-labelledby={buttonId}>
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={`w-full text-left px-3 py-1 text-sm flex items-center justify-between ${!value ? "text-[#7C3AED] font-semibold bg-[#F3F0FF]" : "text-[#6B7280] hover:bg-[#F3F0FF]"} cursor-pointer`}
                onClick={() => { onChange(null); setOpen(false); }}
              >
                <span>{showAllLabel}</span>
                {!value && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 9.5L8 13.5L14 6.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </li>
            {options.map(opt => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  className={`w-full text-left px-3 py-1 text-sm flex items-center justify-between ${value === opt ? "text-[#7C3AED] font-semibold bg-[#F3F0FF]" : "text-[#6B7280] hover:bg-[#F3F0FF]"} cursor-pointer`}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >
                  <span>{opt}</span>
                  {value === opt && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 9.5L8 13.5L14 6.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
