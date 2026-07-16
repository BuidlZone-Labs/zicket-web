import React from "react";
interface CardProps {
  title: string;
  value: string | number;
  percentage: string;
}
function Card({ title, value, percentage }: CardProps) {
  return (
    <div className="p-5 rounded-xl border border-[#E3E3E3] bg-[#F8F8F8]">
      <div className="flex flex-col gap-2 w-full">
        <p className="text-sm font-medium text-[#1E1E1E] ">{title}</p>
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-[#1E1E1E] leading-[100%] tracking-[0%]">
            {value}
          </p>
          <div className="px-2 py-1 rounded-full  bg-[#E5E7EB]">
            <p className="text-xs font-medium text-[#1E1E1E]">{percentage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
