"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

export type PrivacySplitDatum = {
  name: "Anonymous" | "Verified" | "Wallet-Required" | string;
  value: number;
};

const CATEGORY_CONFIG: Record<
  string,
  { color: string; iconSrc: string; label: string }
> = {
  Anonymous: {
    color: "#22C55E",
    iconSrc: "/images/explore/privacy/shield.svg",
    label: "Anonymous",
  },
  Verified: {
    color: "#3B82F6",
    iconSrc: "/images/explore/privacy/lock.svg",
    label: "Verified",
  },
  "Wallet-Required": {
    color: "#F97316",
    iconSrc: "/images/explore/privacy/key.svg",
    label: "Wallet-Required",
  },
};

const FILTER_OPTIONS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_week", label: "This Week" },
  { value: "all_time", label: "All Time" },
];

const DEFAULT_DATA: PrivacySplitDatum[] = [
  { name: "Anonymous", value: 320 },
  { name: "Verified", value: 120 },
  { name: "Wallet-Required", value: 60 },
];

const EMPTY_DATA: PrivacySplitDatum[] = [{ name: "No data", value: 1 }];

type PrivacySplitChartProps = {
  data?: PrivacySplitDatum[];
  empty?: boolean;
  title?: string;
  onFilterChange?: (filter: string) => void;
};

export default function PrivacySplitChart({
  data = DEFAULT_DATA,
  empty = false,
  title = "Privacy Split",
  onFilterChange,
}: PrivacySplitChartProps) {
  const [selectedFilter, setSelectedFilter] = useState("this_month");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const hasRealData =
    !empty && data.length > 0 && data.some((item) => item.value > 0);

  const chartData = empty || !hasRealData ? EMPTY_DATA : data;
  const legendTotal = hasRealData
    ? data.reduce((sum, item) => sum + item.value, 0)
    : 0;
  const isEmptyState = !hasRealData;

  const currentFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.value === selectedFilter)?.label ??
    "This Month";

  const handleFilterSelect = (value: string) => {
    setSelectedFilter(value);
    setDropdownOpen(false);
    onFilterChange?.(value);
  };

  return (
    <div className="w-full rounded-2xl border bg-white p-6 shadow">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gray-100 p-2">
            <img
              src="/images/security-lock.png"
              alt="Privacy"
              className="h-5 w-5"
            />
          </div>
          <h2 className="text-base font-medium text-gray-900">{title}</h2>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            {currentFilterLabel}
            <ChevronDown className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilterSelect(option.value)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedFilter === option.value
                    ? "bg-gray-50 font-medium text-gray-900"
                    : "text-gray-600"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart and legend */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
        {/* Chart container - aligned to left */}
        <div className="relative h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={0}
                strokeWidth={0}
                isAnimationActive={!isEmptyState}
              >
                {chartData.map((entry, index) => {
                  const config = CATEGORY_CONFIG[entry.name];
                  const color = isEmptyState
                    ? "#E5E5E5" // the exact gray from figma for empty state
                    : config?.color ?? "#E5E7EB";

                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              {!isEmptyState && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* The white inner circle with text */}
            <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-sm font-semibold text-[#1E1E1E]">Privacy</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1">
          {hasRealData ? (
            <div className="space-y-3 text-sm">
              {data.map((item) => {
                const config = CATEGORY_CONFIG[item.name];
                if (!config) return null;

                const percentage =
                  legendTotal > 0
                    ? Math.round((item.value / legendTotal) * 100)
                    : 0;

                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <img
                      src={config.iconSrc}
                      alt={config.label}
                      className="h-5 w-5"
                    />
                    <span className="text-gray-700">
                      {percentage}% {config.label} - {item.value}
                    </span>
                  </div>
                );
              })}

              <p className="pt-1 font-medium text-gray-900">
                Total: &nbsp;{legendTotal}
              </p>
            </div>
          ) : (
            <div className="flex min-h-[100px] items-center justify-start pl-4 text-[15px] font-medium text-[#1E1E1E]">
              No Data to Show yet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
