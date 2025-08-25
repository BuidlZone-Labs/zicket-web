import { StarIcon } from "@/public/svg/svg";
import { FC } from "react";
interface OffersProps {
  perks: string[];
}
export const WhatYouWillGetCard: FC<OffersProps> = ({ perks }) => {
  return (
    <div className="p-8 border border-[#E9E9E9] rounded-xl space-y-6 dark:border-[#232323]">
      <div>
        <p className="text-xl sm:text-2xl font-semibold dark:text-[#E0E0E0] text-[#1F1F1F]">
          Privacy Info
        </p>
      </div>
      <hr className="w-full h-0.5" />

      <div>
        <ul className="space-y-4">
          {perks.map((perk, index) => (
            <li key={index}>
              <div className="flex gap-4 items-center">
                <div className="size-8 rounded-full border border-[#2C0A4A] flex items-center justify-center dark:border-[#D7B5F5] dark:text-[#D7B5F5]">
                  <StarIcon />
                </div>
                <p className="sm:text-base dark:text-[#454545] font-medium text-sm">
                  {perk}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
