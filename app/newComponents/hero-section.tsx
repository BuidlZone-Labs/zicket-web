import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <div
      className="min-h-screen relative overflow-hidden -top-32 pt-32 flex flex-col items-center justify-center text-white"
      style={{
        backgroundImage: "url('/Herosection.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center text-center px-6 py-8 lg:py-20">
        <h1 className="text-4xl md:text-6xl lg:text-[64px] font-bold text-white mb-6 leading-tight">
          Public or Private Events.
          <br />
          <span className="text-[#FFFFFF]">Host Freely. Attend Silently.</span>
        </h1>
        <p className="text-[16px] md:text-xl text-[#A8ADBD] mb-12">
          Empowering hosts. Shielding guests. Reinventing event privacy.
        </p>
        <Button
          size="lg"
          className="group bg-[#4B107C] hover:bg-purple-600 text-white border-none px-8 py-4 text-lg font-semibold rounded-full shadow-lg shadow-[#751AC63D] hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <span>Explore Events Anonymously</span>
          <ArrowUpRight className="w-5 h-5 ml-2 group-hover:rotate-45 delay-300 transition-all" />
        </Button>
      </div>

      {/* Trust Markers */}
      <div className="w-full flex items-center justify-center gap-6">
        <div className="text-[#2C0A4A] bg-[#D1B7E6] px-4 py-2">Trust markers</div>
        <Image src="/stellar.webp" alt="" width="70" height="70" />
        <Image src="/aztec-logo.png" alt="" width="70" height="70" />
      </div>
    </div>
  );
}
