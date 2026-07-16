import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface DashboardGreetingProps {
  name?: string;
}

export default function DashboardGreeting({ name = 'David' }: DashboardGreetingProps) {
  return (
    <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-12 h-[80px] bg-[#FCFCFD]">
      {/* Greeting Text */}
      <h2 className="text-xl md:text-2xl font-semibold text-[#101828] leading-tight tracking-tight">
        Welcome Back, {name} 👋
      </h2>

      {/* New Event CTA */}
      <Link
        href="/zkorg/events/new"
        className="inline-flex items-center gap-2 bg-[#6917AF] hover:bg-[#5a13a0] active:bg-[#4e0f91] text-white font-semibold text-sm md:text-[15px] px-5 md:px-6 py-2.5 rounded-full transition-colors duration-200 shrink-0 shadow-sm"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>New Event</span>
      </Link>
    </div>
  );
}
