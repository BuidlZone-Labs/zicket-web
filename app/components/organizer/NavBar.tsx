'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Logo from "@/public/images/Logo.png";
import Image from "next/image";
import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/privacyAnalytics";
import { useUserSessionSync } from '@/lib/user-session-sync';
import { useDebounce } from '@/hooks/useDebounce';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { walletConnected, setWalletConnected } = useUserSessionSync();

  // Use debounced search query for API calls
  useEffect(() => {
    if (debouncedSearchQuery) {
      // TODO: Replace with actual search API call
      console.log('Searching for:', debouncedSearchQuery);
      // Example: searchEvents(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const connectWallet = () => {
    trackAnalyticsEvent('wallet_connect_cta_clicked', { source: 'organizer_navbar' });
    setWalletConnected(true);
    console.log('Connecting wallet...');
  };

  const navLinks = [
    { name: 'Overview', href: '/zkorg/dashboard', active: true },
    { name: 'Events', href: '/zkorg/events', active: false },
    { name: 'Orders', href: '/zkorg/orders', active: false },
    { name: 'zkEmail Center', href: '/zkorg/zkemail', active: false }
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="cursor-pointer flex items-center space-x-2 dark:drop-shadow-[0_0_2em_rgba(255,255,255,0.85)]"
            >
              <Image src={Logo} alt="Zicket Logo" className="h-8 w-auto" width={120} height={32} />
            </Link>
          </div>

          {/* Center Section: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`px-4 py-2.5 text-[15px] font-medium transition-all duration-200 rounded-lg ${
                  link.active
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Section: Search, Icons, Connect Button */}
          <div className="flex items-center space-x-4">
            {/* Search Bar (Desktop) */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search your events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[280px] pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Search Icon (Mobile & Tablet) */}
            <button className="lg:hidden p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Notification Icon */}
            <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>

            {/* Settings Icon */}
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>

            {/* Connect Wallet Button */}
            <button
              onClick={connectWallet}
              className="hidden sm:inline-flex items-center px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm"
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 pt-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      link.active
                        ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Mobile Connect Wallet Button */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex justify-center items-center px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-base font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
