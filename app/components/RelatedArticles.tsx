"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { NewsCard } from "@/app/components/NewsCard";
import type { Article } from "@/lib/types";
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

const ARTICLES_PER_PAGE = 3;

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(articles.length / ARTICLES_PER_PAGE);
  }, [articles.length]);

  const paginatedArticles = useMemo(() => {
    const startIndex = currentPage * ARTICLES_PER_PAGE;
    return articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [currentPage, articles]);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-20 gap-15 px-[1.25rem] flex flex-col items-center justify-center">
      <div className="flex lg:hidden justify-between items-end w-full">
        <h2 className="text-2xl font-bold font-satoshi text-text-detail tracking-[-1.2px]">
          Trending News
        </h2>
        <Link
          href="/news"
          className="flex items-center text-base font-bold font-satoshi text-text-detail hover:text-primary transition-colors border-b border-text-detail"
        >
          See All News
          <ArrowUpRightIcon className="w-5 h-6" />
        </Link>
      </div>

      <div className="hidden lg:flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold font-satoshi text-text-detail tracking-[-1.2px]">
          See More
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center justify-center gap-[3.333px] pr-[13.333px] pl-[10px] py-[10px] rounded-[83.333px] transition-colors ${
              currentPage === 0
                ? "border-[0.833px] border-black opacity-50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <ChevronLeftIcon
              className={`w-5 h-5 ${
                currentPage === 0 ? "text-black" : "text-white"
              }`}
            />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center justify-center gap-[3.333px] pl-[13.333px] pr-[10px] py-[10px] rounded-[83.333px] transition-colors ${
              currentPage === totalPages - 1
                ? "border-[0.833px] border-black opacity-50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <ChevronRightIcon
              className={`w-5 h-5 ${
                currentPage === totalPages - 1 ? "text-black" : "text-white"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex lg:hidden gap-5 justify-between w-full overflow-x-scroll scrollbar-hide">
        {articles.map((relatedArticle) => (
          <NewsCard key={relatedArticle.id} article={relatedArticle} />
        ))}
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-8 w-full">
        {paginatedArticles.map((relatedArticle) => (
          <NewsCard key={relatedArticle.id} article={relatedArticle} />
        ))}
      </div>
    </section>
  );
}
