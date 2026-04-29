import React from "react";
import Image from "next/image";
import LogoWhite from "../../public/images/LogoWhite.png";
import { LinkedInIcon, TwitterIcon } from "@/public/svg/svg";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="p-5 text-white">
      <div className="w-full bg-[#1E1E1E] px-5 sm:px-25 py-4 sm:py-12 rounded-[24px]">
        <div className="flex flex-wrap gap-10 justify-between">
          <div className="w-80">
            <Image
              src={LogoWhite}
              alt="Zicket"
              className="h-8 w-auto"
              height={32}
              width={120}
            />
            <p className="text-sm text-[#A8A8A8] mt-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div className="w-full max-w-108">
            <div className="w-full flex max-w-108 h-11 border border-[#606163] rounded-full overflow-hidden p-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Subscribe to our newsletter..."
                className="w-full outline-0 p-3 text-[#FCFDFD] text-xs"
              />
              <button className="bg-[#6917AF] rounded-full flex gap-2 justify-center items-center text-white py-3 px-6 w-max text-sm whitespace-nowrap">
                Join Now
                <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#CECECE] mt-5">
              By subscribing you agree to with our{" "}
              <button type="button" className="underline hover:text-white">
                Privacy Policy
              </button>
            </p>
            <div className="flex gap-4 items-center mt-5">
              <h2 className="text-base font-semibold">Connect with Us:</h2>
              <div className="flex gap-2 items-center">
                <Link href="https://x.com" aria-label="Follow Zicket on X" className="inline-flex">
                  <TwitterIcon />
                </Link>
                <Link
                  href="https://www.linkedin.com"
                  aria-label="Follow Zicket on LinkedIn"
                  className="inline-flex"
                >
                  <LinkedInIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-10 justify-between pt-9 border-t mt-10 sm:mt-20 border-[#5E5E5E]">
          <nav className="flex w-full max-w-89 justify-between text-xs" aria-label="Footer navigation">
            <Link href="/explore">Explore</Link>
            <Link href="/login">Host Event</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/about">About</Link>
            <Link href="/#faqs">FAQs</Link>
          </nav>
          <div>
            <p className="text-sm">&copy; 2025 Zicket. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
