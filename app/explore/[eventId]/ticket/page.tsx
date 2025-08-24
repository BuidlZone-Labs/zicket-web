"use client";

import { ShieldEllipsis, TriangleAlert, User } from "lucide-react";
import Image from "next/image";

export default function TicketPage() {
  return (
    <div className="text-black dark:text-white flex items-center justify-center gap-8">
      <div className="border-[1px] border-[#E9E9E9] p-8 rounded-[12px] w-[680px]">
        <div className="text-[#1F1F1F] text-[24px] font-semibold font-inter">
          Ticket Info
        </div>
        <div className="py-6">
          <hr />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#7D7D7D] text-[16px] font-medium font-inter">
                Enter your name
              </label>
              <div className="relative">
                <User className="absolute right-4 text-black top-1/2 -translate-y-1/2 w-[21px] h-[21px]" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g John Doe"
                  className="px-6 py-4 rounded-[12px] w-full border-[1px] border-[#E4E5E6] focus:border-[#6917AF] outline-none transition-colors duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#7D7D7D] text-[16px] font-medium font-inter">
                Your age
              </label>
              <div className="relative">
                <User className="absolute right-4 text-black top-1/2 -translate-y-1/2 w-[21px] h-[21px]" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g 18"
                  className="px-6 py-4 rounded-[12px] w-full border-[1px] border-[#E4E5E6] focus:border-[#6917AF] outline-none transition-colors duration-300"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F2FFF2] px-5 py-3 rounded-[4px]">
            <TriangleAlert size={16} className="text-[#0ABA2A]" />
            <span className="text-[12px] text-[#0ABA2A] font-medium font-mono">
              Secure & Instant Payment
            </span>
          </div>
          <div>
            <button className="flex justify-center items-center gap-1 w-full rounded-[88.51px] bg-[#6917AF] text-[#FCFDFD] px-6 py-4">
              <ShieldEllipsis size={21} />
              <span className="font-bold font-satoshi">Verify & Attend</span>
            </button>
          </div>
        </div>
      </div>
      <div className="border-[1px] border-[#E9E9E9] p-8 rounded-[12px] w-[480px]">
        <div className="text-[#1F1F1F] text-[24px] font-semibold font-inter">
          Ticket Summary
        </div>
        <div className="py-6">
          <hr />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex gap-5">
            <div>
              <Image src="" alt="image" width={100} height={100} />
            </div>
            <div></div>
          </div>
          <div className="p-4"></div>
        </div>
      </div>
    </div>
  );
}
