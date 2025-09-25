"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Shield, ChevronDown } from "lucide-react";

const COLORS = ["#22C55E", "#3B82F6", "#F97316"];

const mockData = [
  { name: "Anonymous", value: 320 },
  { name: "Verified", value: 120 },
  { name: "Wallet-Required", value: 60 },
];

export default function PrivacySplitChart({ empty = false }: { empty?: boolean }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow border w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <div className="bg-gray-200 py-2 px-2 rounded-full ">
                          <Shield className="w-5 h-5 text-black" />

            </div>
          <h2 className="text-lg text-black ">Privacy Split</h2>
        </div>
        <button className="text-sm flex items-center gap-2 text-gray-500 border border-gray-400  rounded-full  px-5 py-1">
          This Month 
          <ChevronDown className="mb-1"/>
        </button>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
          <div className="w-24 h-24 border-[12px] border-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm text-gray-600">Privacy</span>
          </div>
          <p className="mt-2">No Data to Show yet...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={280}>
            <PieChart>
              <Pie
                data={mockData}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                <span className="text-black">Privacy</span>
                {mockData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
<div className="mt-4 text-sm space-y-3 text-gray-800">
  <p className="flex items-center gap-2">
    <img src="/images/verify.png" alt="Anonymous" className="w-4 h-4" />
    64% Anonymous – 320
  </p>
  <p className="flex items-center gap-2">
    <img src="/images/padlock.png" alt="Verified" className="w-4 h-4" />
    24% Verified – 120
  </p>
  <p className="flex items-center gap-2">
    <img src="/images/key.png" alt="Wallet-Required" className="w-4 h-4" />
    12% Wallet-Required – 60
  </p>
  <p className="font-medium">Total: 500</p>
</div>

          </div>
        </>
      )}
    </div>
  );
}
