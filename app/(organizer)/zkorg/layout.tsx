'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Logo from "@/public/images/Logo.png";
import SearchIcon from "@/public/Search.png";
import NotificationIcon from "@/public/notification-block-03.png";
import SettingsIcon from "@/public/Vector.png";
import UserProfileIcon from "@/public/Ellipse 8.png";
import { ChevronDown } from 'lucide-react';

function NavBar() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('v') || 'overview';

    const navLinks = [
        { name: 'Overview', key: 'overview' },
        { name: 'Events', key: 'events' },
        { name: 'Orders', key: 'orders' },
        { name: 'zkEmail Center', key: 'zkemail' },
    ];

    return (
        <nav className="flex items-center justify-between px-12 py-4 bg-white border-b border-[#F2F4F7] h-[80px]">
            <div className="flex items-center gap-14">
                <Link href="/" className="shrink-0">
                    <Image
                        src={Logo}
                        alt="Zicket"
                        height={32}
                        className="h-8 w-auto"
                    />
                </Link>
                <div className="flex items-center gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.key}
                            href={`?v=${link.key}`}
                            className={`px-4 py-2 text-[16px] font-medium transition-colors duration-200 ${currentTab === link.key ? 'text-[#6917AF]' : 'text-[#475467] hover:text-[#6917AF]'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Image src={SearchIcon} alt="Search" width={20} height={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your events..."
                        className="w-[340px] h-[48px] pl-12 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-full text-[15px] focus:outline-none focus:ring-1 focus:ring-[#6917AF] focus:border-[#6917AF] placeholder-[#667085] shadow-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 hover:bg-gray-50 rounded-full transition-colors relative border border-[#EAECF0]">
                        <Image src={NotificationIcon} alt="Notifications" width={24} height={24} />
                        <span className="absolute top-[10px] right-[10px] w-2.5 h-2.5 bg-[#6917AF] rounded-full border-2 border-white" />
                    </button>

                    <button className="p-2.5 hover:bg-gray-50 rounded-full transition-colors border border-[#EAECF0]">
                        <Image src={SettingsIcon} alt="Settings" width={24} height={24} />
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-2 pr-4 py-2 border border-[#EAECF0] rounded-full hover:bg-gray-50 cursor-pointer transition-colors h-[48px] shadow-sm">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <Image src={UserProfileIcon} alt="Profile" width={32} height={32} className="object-cover" />
                    </div>
                    <span className="text-[15px] font-medium text-[#101828]">0xC5B...01c</span>
                    <ChevronDown size={18} className="text-[#667085]" />
                </div>
            </div>
        </nav>
    );
}

export default function ZkorgLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FCFCFD]">
            <Suspense fallback={<div className="h-[80px] bg-white border-b border-[#F2F4F7]" />}>
                <NavBar />
            </Suspense>
            <main className="w-full max-w-[1440px] mx-auto">
                {children}
            </main>
        </div>
    );
}
