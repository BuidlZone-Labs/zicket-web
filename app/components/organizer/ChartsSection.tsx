"use client";

import RevenueTrendsChart from "./RevenueTrendsChart";
import PrivacySplitChart from "./PrivacySplitChart";

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mx-26">
      <div className="md:col-span-2">
        <RevenueTrendsChart empty={false} />
      </div>

      <div className="md:col-span-1">
        <PrivacySplitChart empty={false} />
      </div>
    </div>
  );
}
