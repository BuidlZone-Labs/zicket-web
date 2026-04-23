"use client";

import { FC } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface PurchasedStageProps {
  isConfirming?: boolean;
  onViewAccessCode?: () => void;
  onCancelRegistration?: () => void;
}

export const PurchasedStage: FC<PurchasedStageProps> = ({
  isConfirming = false,
  onViewAccessCode,
  onCancelRegistration,
}) => {
  return (
    <div className="p-8 border border-[#E9E9E9] rounded-2xl dark:border-[#232323] w-full bg-white dark:bg-[#0A0A0A] shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-work-sans">
      {isConfirming && (
        <div className="flex items-center gap-2 mb-5 bg-[#FFF8E7] border border-[#F6C90E] text-[#856404] py-3 px-4 rounded-lg">
          <Loader2 className="animate-spin shrink-0" size={16} />
          <p className="text-xs font-medium">
            Confirming on-chain… your ticket is reserved.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[32px] font-bold text-[#1F1F1F] dark:text-white">
          You&apos;re In!
        </h2>
        <button className="flex items-center gap-2 px-5 py-2 border border-[#6917AF] rounded-xl text-sm font-semibold text-[#6917AF] hover:bg-[#6917AF]/5 transition-colors bg-white dark:bg-transparent">
          <Image src="/calendar-04.png" alt="Calendar" width={20} height={20} />
          <span>Add to calendar</span>
        </button>
      </div>

      <hr className="w-full border-[#F0F0F0] dark:border-[#232323] mb-8" />

      <div className="flex items-center gap-3 text-[#5C6170] dark:text-[#98A2B3] mb-8">
        <Image
          src="/mail-secure-01.png"
          alt="Mail Secure"
          width={24}
          height={24}
        />
        <p className="italic text-lg">
          Reminder sent via{" "}
          <span className="font-bold text-[#1F1F1F] dark:text-white">
            zkEmail
          </span>
          .
        </p>
      </div>

      <div className="p-3.5 bg-[#F2FFF2] dark:bg-[#0F1D0F]/30 rounded-lg flex items-center gap-3 mb-10">
        <div className="flex-shrink-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0ABA2A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-[#0ABA2A] dark:text-[#0BD330]">
          We don&apos;t store or track any of your info.
        </p>
      </div>

      <div className="flex gap-5">
        <button
          onClick={onViewAccessCode}
          disabled={isConfirming}
          className="flex-1 py-4 bg-[#6917AF] text-white rounded-full flex items-center justify-center gap-3 hover:bg-[#5A1396] transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Image src="/qr-code-01.png" alt="QR Code" width={24} height={24} />
          <span className="text-md">View Access Code</span>
        </button>

        <button
          onClick={onCancelRegistration}
          disabled={isConfirming}
          className="flex-1 py-4 border-2 border-[#6917AF] text-[#6917AF] dark:text-[#E0E0E0] rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#6917AF]/5 transition-all outline-none active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Image
            src="/multiplication-sign.png"
            alt="Cancel"
            width={24}
            height={24}
          />
          <span className="text-md">Cancel Registration</span>
        </button>
      </div>
    </div>
  );
};
