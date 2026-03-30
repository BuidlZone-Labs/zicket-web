"use client";
import { useState } from "react";
import React from "react";
import Logo from "@/public/images/Logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarsIcon } from "@/public/svg/svg";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "./DarkModeToggle";
import { Search } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { useUserSessionSync } from "@/lib/user-session-sync";

function Header() {
  type NavLink = {
    name: string;
    href: string;
  };
  const [isOpen, setIsOpen] = useState(false);
  const { anonymousBrowsing, setAnonymousBrowsing } = useUserSessionSync();
  const navLinks: NavLink[] = [
    { name: "Explore", href: "/explore" },
    { name: "News", href: "/news" },
    { name: "Plans", href: "/plans" },
  ];
  const pathname = usePathname();

  if (pathname?.startsWith("/zkorg")) {
    return null;
  }

  return (
    <div className="pt-5 px-5 sticky top-0 z-20 backdrop-blur-md">
      <div className="pl-6 pr-4 py-4 w-full max-w-[1200px] m-auto border border-[#E4E4E4] bg-[#FFFFFFCC] rounded-[100px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="cursor-pointer dark:drop-shadow-[0_0_2em_rgba(255,255,255,0.85)]"
          >
            <Image src={Logo} alt="Zicket Logo" className="h-5 w-auto" width={120} height={20} priority />
          </Link>
          <div className="hidden md:flex gap-6 text-sm">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 text-sm font-medium ${pathname === link.href
                      ? "text-[#6917AF] dark:text-[#D7B5F5]"
                      : "text-[#172233] dark:text-white hover:text-[#6917AF] dark:hover:text-[#D7B5F5]"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Anonymously"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6917AF] focus:border-transparent"
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#172233] dark:text-white">
              Anonymous Browsing
            </span>
            <Switch
              checked={anonymousBrowsing}
              onCheckedChange={setAnonymousBrowsing}
              className="data-[state=checked]:bg-[#6917AF]"
            />
            <span className="text-sm font-medium text-[#172233] dark:text-white">
              {anonymousBrowsing ? "ON" : "OFF"}
            </span>
          </div>
          <a href="/login" className="group flex gap-1 items-center cursor-pointer px-6 py-3 border border-[#8F37DA] bg-gradient-to-b from-[#5E4BF3] to-[#9109D0] text-white dark:text-[#6917AF] rounded-full font-bold transition-all duration-300 dark:hover:drop-shadow-[0_0_2em_rgba(255,255,255,0.3)] dark:hover:text-gray-50">
            Host Event <ArrowUpRight size="15" className="group-hover:rotate-45 delay-300 transition-all" />
          </a>
        </div>
        {/* mobile nav */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden border-2 border-[#751AC6] rounded-lg p-3"
        >
          <BarsIcon />
        </button>
        {isOpen && (
          <div className="absolute lg:hidden right-20 top-20 w-fit p-5 flex flex-col gap-5  bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <div className="md:hidden flex flex-col gap-3 text-sm">
              {navLinks.map((link) => {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2 ${pathname === link.href
                        ? "text-[#6917AF]"
                        : "text-[#172233] hover:text-[#6917AF]"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Anonymously"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6917AF] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#172233]">
                Anonymous Browsing
              </span>
              <Switch
                checked={anonymousBrowsing}
                onCheckedChange={setAnonymousBrowsing}
                className="data-[state=checked]:bg-[#6917AF]"
              />
              <span className="text-sm font-medium text-[#172233]">
                {anonymousBrowsing ? "ON" : "OFF"}
              </span>
            </div>
            <a href="/login" className="flex px-6 py-3 bg-[#6917AF] text-white rounded-full font-bold">
              Host Event
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      <div className="hidden md:block absolute top-12 right-6">
        <ModeToggle />
      </div>
    </div>
  );
}

export default Header;
