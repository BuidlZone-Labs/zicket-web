import React from "react";
import LogoWhite from "../../public/images/LogoWhite.png";
import { LinkedInIcon, TwitterIcon } from "@/public/svg/svg";
import { ArrowUpRight } from "lucide-react";

function Footer() {
  return (
    <div className="p-5 text-white">
      <div className="w-full bg-[#1E1E1E] px-5 sm:px-25 py-4 sm:py-12 rounded-[24px]">
        <div className="flex flex-wrap gap-10 justify-between">
          <div className="w-80">
            <img src={LogoWhite.src} alt="Logo" className="h-8 w-auto" />
            <p className="text-sm text-[#A8A8A8] mt-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div className="w-full max-w-108">
            <div className="w-full flex max-w-108 h-11 border border-[#606163] rounded-full overflow-hidden p-1">
              <input
                type="email"
                placeholder="Subscribe to our newsletter..."
                className="w-full outline-0 p-3 text-[#FCFDFD] text-xs"
              />
              <button className="bg-[#6917AF] rounded-full flex  gap-2 justify-center items-center text-white py-3 px-6 w-max text-sm whitespace-nowrap">
                Join Now
                <ArrowUpRight w-5 h-5/>
              </button>
            </div>
            <p className="text-xs text-[#CECECE] mt-5">
              By subscribing you agree to with our{" "}
              <span className="cursor-pointer underline">Privacy Policy</span>
            </p>
            <h4 className="flex gap-4 items-center mt-5">
              Connect with Us:
              <span className="flex gap-2 items-center">
                <TwitterIcon />
                <LinkedInIcon />
              </span>
            </h4>
          </div>
        </div>
        <div className="flex flex-wrap gap-10 justify-between pt-9 border-t mt-10 sm:mt-20 border-[#5E5E5E]">
          <div className="flex w-full max-w-89 justify-between text-xs">
            <p>Explore</p>
            <p>Host Event</p>
            <p>How It Works</p>
            <p>About</p>
            <p>FAQs</p>
          </div>
          <div>
            <p className="text-sm">© 2025 Zicket. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
