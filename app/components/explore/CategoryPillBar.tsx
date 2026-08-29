"use client";

import {
  CATEGORY_PILLS,
  type CategoryPillValue,
} from "./categoryFilters";

interface CategoryPillBarProps {
  activeCategory: CategoryPillValue | null;
  onCategoryChange: (category: CategoryPillValue | null) => void;
  className?: string;
}

const pillClasses =
  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2 active:scale-95";

export default function CategoryPillBar({
  activeCategory,
  onCategoryChange,
  className = "",
}: CategoryPillBarProps) {
  const pills = [{ label: "All events", value: null }, ...CATEGORY_PILLS] as const;

  return (
    <nav
      aria-label="Event categories"
      className={`relative min-w-0 ${className}`.trim()}
    >
      <div
        role="list"
        className="flex gap-2 overflow-x-auto px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pills.map((pill) => {
          const isActive = activeCategory === pill.value;

          return (
            <span key={pill.label} role="listitem" className="shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                className={`${pillClasses} ${
                  isActive
                    ? "border-[#6917AF] bg-[#6917AF] text-white shadow-sm"
                    : "border-[#E5E7EB] bg-white text-[#5C6170] hover:border-[#C4B5FD] hover:bg-[#F4EEFF] hover:text-[#5912D1] dark:border-[#34313A] dark:bg-[#17151B] dark:text-[#D4D0DA] dark:hover:bg-[#261E31]"
                }`}
                onClick={() => onCategoryChange(pill.value)}
              >
                {pill.label}
              </button>
            </span>
          );
        })}
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent sm:hidden dark:from-[#0D0D0D]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden dark:from-[#0D0D0D]"
      />
    </nav>
  );
}

export type { CategoryPillValue } from "./categoryFilters";
