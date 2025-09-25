"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function ConnectWalletPrompt() {
  function connectWallet() {
    console.log("Connect Wallet clicked 🚀");
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl mx-auto my-8 border-2 border-gray-200 rounded-xl pt-6 pb-6 px-20  md:px-[120px] bg-white">
      <div className="flex-shrink-0">
        <Image
          src="/images/placeholder-illustration.png"
          alt="Wallet illustration"
          width={400}
          height={300}
          className="max-w-full"
        />
      </div>

      <div className="flex flex-col justify-center text-center gap-3 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-gray-900">
          Connect your wallet
        </h2>

        <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
          Connect your Azguard wallet to receive payments from paid events.
        </p>

       <div>
         <button
          onClick={connectWallet}
          className="inline-flex group items-center cursor-pointer gap-2 bg-purple-700 hover:bg-purple-800 text-white font-medium px-10 py-4 rounded-full transition whitespace-nowrap"
        >
          Connect Wallet
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition ease-in-out duration-300" />
        </button>
       </div>
      </div>
    </div>
  );
}
