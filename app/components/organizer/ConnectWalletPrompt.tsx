"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function ConnectWalletPrompt() {
  function connectWallet() {
    console.log("Connect Wallet clicked");
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 border border-[#E3E3E3] rounded-2xl py-8 px-6 md:px-16 bg-white">
      <div className="shrink-0">
        <Image
          src="/images/connect-wallet-illustration.png"
          alt="Two people connecting a plug illustration"
          width={350}
          height={260}
          className="w-70 md:w-87.5 h-auto"
        />
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D2939]">
          Connect you wallet
        </h2>

        <p className="text-sm md:text-base text-[#475467] leading-relaxed max-w-70">
          Connect your Azguard wallet to receive payments from paid events.
        </p>

        <div className="mt-2">
          <button
            onClick={connectWallet}
            className="inline-flex group items-center cursor-pointer gap-2 bg-[#6917AF] hover:bg-[#5A1296] text-white font-medium text-sm md:text-base px-8 py-3 rounded-full transition whitespace-nowrap"
          >
            Connect Wallet
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition ease-in-out duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}