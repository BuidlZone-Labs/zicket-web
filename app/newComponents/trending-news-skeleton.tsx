import React from "react";

export function TrendingNewsSkeleton() {
  return (
    <section className="max-w-[1200px] mx-auto py-8 lg:py-20 px-4" aria-label="Loading trending news">
      <div className="flex justify-between items-center mb-12">
        <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[380px] bg-gray-100 dark:bg-zinc-900 rounded-lg animate-pulse p-4 flex flex-col justify-between">
            <div className="w-full h-48 bg-gray-200 dark:bg-zinc-800 rounded-t-lg" />
            <div className="space-y-3 mt-4 flex-1">
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
