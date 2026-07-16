"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { articles } from "@/lib/data";
import React from "react";
import Link from "next/link";

// Get unique categories from articles
const categories = ["All", ...Array.from(new Set(articles.map(article => article.category)))];

const ANNOUNCEMENT = {
  title: "How early adopters used Zicket to host 12 exclusive events in 3 cities.",
  author: "John Doe",
  role: "Checkout Experiences Product Team",
  date: "December 7, 2022",
  avatar: "/images/john-doe.png",
};

const PAGE_SIZE = 6;

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);

  // Filter and paginate articles
  const filtered =
    selectedCategory === "All"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#141414]">
      <main className="flex-1 w-full flex flex-col items-center px-4 md:px-0">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center mt-10 mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 text-[#2C0A4A] dark:text-[#D7B5F5]">
            Newsroom
          </h1>
          <p className="text-center text-[#6C6C6C] mb-6">
            The latest news and views from Zicket
          </p>
          <form
            className="flex flex-col md:flex-row items-center gap-3 w-full max-w-4xl mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              // handle subscribe
            }}
          >
            <div className="relative w-full">
              <input
                type="email"
                required
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[#E0E0E0] pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9747FF] text-black"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C6C6C] pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 17.5v-11zm1.75.75l7.72 6.18a2.25 2.25 0 002.78 0l7.72-6.18" stroke="#6C6C6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </form>
          <Button
            type="submit"
            className="rounded-full px-4 py-6 mb-4 shadow-md border border-[#BF37DA] text-white text-lg"
            style={{
              background: "linear-gradient(90deg, #5E4BF3 0%, #9109D0 100%)",
              boxShadow: "0 4px 16px 0 rgba(94, 75, 243, 0.15)",
            }}
          >
            Subscribe!
          </Button>
        </section>

        {/* Announcement + Hero */}
        <section className="w-full max-w-6xl flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1 min-w-[280px] flex items-center justify-center">
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/hero-img.png"
                alt="Newsroom Hero"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="flex-1 min-w-[280px] flex flex-col justify-center gap-4">
            <span className="uppercase text-xs font-bold text-[#6917AF] tracking-wider">
              Announcements
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
              {ANNOUNCEMENT.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative w-10 h-10">
                <Image
                  src={ANNOUNCEMENT.avatar}
                  alt={ANNOUNCEMENT.author}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-black dark:text-white">
                  {ANNOUNCEMENT.author}
                </span>
                <span className="text-xs text-[#6C6C6C]">
                  {ANNOUNCEMENT.role}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#6C6C6C] mt-1">
              {ANNOUNCEMENT.date}
            </span>
          </div>
        </section>

        {/* Category Filter */}
        <section className="w-full max-w-6xl flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-5 py-2 rounded-full border font-semibold text-sm transition-all ${selectedCategory === cat
                  ? "bg-[#6917AF] text-white border-[#9747FF]"
                  : "bg-white text-[#6917AF] border-[#9747FF] dark:bg-[#232323] dark:text-[#D7B5F5]"
                }`}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Articles Grid */}
        <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {paginated.map((article) => (
            <Link href={`/news/${article.slug}`} key={article.id} className="bg-white rounded-2xl dark:bg-[#181818] flex flex-col overflow-hidden cursor-pointer hover:border hover:border-[#E0E0E0] dark:border-[#282828] hover:rounded-2xl hover:shadow-sm">
              <div className="relative w-full h-44 md:h-52">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-5 py-6 flex flex-col gap-2.5 flex-1">
                <p className="text-xs text-[#5C6170]">
                  {article.category} - {article.date}
                </p>
                <p className="font-bold text-base md:text-lg text-black dark:text-[#D7B5F5]">
                  {article.title}
                </p>
                <p className="text-xs text-[#5C6170] line-clamp-3">{article.excerpt}</p>
              </div>
              <div className="px-5 pb-5 flex items-center gap-3">
                <div className="relative w-6 h-6">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-sm text-[#1E1E1E] dark:text-[#D7B5F5] font-medium">
                  {article.author.name}
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* Pagination */}
        <section className="flex gap-2 mb-16 items-center justify-center">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`w-8 h-8 rounded-md mx-1 flex items-center justify-center text-sm transition-all
                ${page === i + 1
                  ? "bg-[#6917AF] text-white"
                  : "bg-[#F4EBFF] text-[#9747FF]"}
              `}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-4 py-2 rounded-md mx-1 text-sm bg-[#FAFAFA] text-black transition-all cursor-pointer"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            className="px-4 py-2 rounded-md mx-1 text-sm bg-[#FAFAFA] text-black transition-all cursor-pointer"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
