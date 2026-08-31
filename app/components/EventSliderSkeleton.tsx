import React from "react";

export default function EventSliderSkeleton() {
  return (
    <section className="w-full max-w-6xl mx-auto py-8" aria-label="Loading events">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 bg-gray-100 dark:bg-zinc-900 rounded-xl animate-pulse p-4 flex flex-col justify-between">
            <div className="w-full h-44 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="space-y-2 mt-4">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
