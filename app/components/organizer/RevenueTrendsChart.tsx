"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Shield, ChevronDown } from "lucide-react";

const mockData = [
  { date: "Jun 08", revenue: 20000 },
  { date: "Jun 12", revenue: 80000 },
  { date: "Jun 16", revenue: 160000 },
  { date: "Jun 20", revenue: 100000 },
  { date: "Jun 24", revenue: 240000 },
  { date: "Jun 28", revenue: 280000 },
];

export default function RevenueTrendsChart({ empty = false }: { empty?: boolean }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow border w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
                <div className="bg-gray-200 py-2 px-2 rounded-full ">
                          <Shield className="w-5 h-5 text-black" />

            </div>
          <h2 className="text-lg text-black">Revenue trends</h2>
        </div>
 <button className="text-sm flex items-center gap-2 text-gray-500 border border-gray-400  rounded-full  px-5 py-1">
          This Month 
          <ChevronDown className="mb-1"/>
        </button>
      </div>

      {/* Chart */}
      {empty ? (
        <div className="flex items-center justify-center h-[280px] text-gray-400">
          No Data to Show yet...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, 320000]}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#9333EA"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
