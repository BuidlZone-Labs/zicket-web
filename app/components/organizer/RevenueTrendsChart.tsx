'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export interface RevenueDataPoint {
  date: string;
  value: number;
}

interface RevenueTrendsProps {
  data?: RevenueDataPoint[];
  onPeriodChange?: (period: string) => void;
}

const defaultData: RevenueDataPoint[] = [
  { date: 'Jun 08', value: 5000 },
  { date: 'Jun 10', value: 22000 },
  { date: 'Jun 12', value: 18000 },
  { date: 'Jun 14', value: 48000 },
  { date: 'Jun 16', value: 150030 },
  { date: 'Jun 18', value: 95000 },
  { date: 'Jun 20', value: 60000 },
  { date: 'Jun 22', value: 55000 },
  { date: 'Jun 24', value: 45000 },
  { date: 'Jun 28', value: 28000 },
];

// Placeholder X-axis dates for the empty state skeleton chart
const EMPTY_STATE_DATES = [
  'Jun 08', 'Jun 10', 'Jun 12', 'Jun 14', 'Jun 16',
  'Jun 18', 'Jun 20', 'Jun 22', 'Jun 24', 'Jun 26', 'Jun 28',
];

const Y_TICKS_DISPLAY = [0, 20000, 40000, 80000, 160000, 320000];
const Y_TICK_COUNT = Y_TICKS_DISPLAY.length;

function toLinear(realValue: number): number {
  const maxDisplay = Y_TICKS_DISPLAY[Y_TICK_COUNT - 1];
  for (let i = 0; i < Y_TICK_COUNT - 1; i++) {
    const lo = Y_TICKS_DISPLAY[i];
    const hi = Y_TICKS_DISPLAY[i + 1];
    if (realValue <= hi) {
      return i + (realValue - lo) / (hi - lo);
    }
  }
  return Y_TICK_COUNT - 1;
}

/** Format the linearised tick index back to a dollar label */
function formatYAxis(linearTick: number): string {
  const idx = Math.round(linearTick);
  if (idx < 0 || idx >= Y_TICK_COUNT) return '';
  const val = Y_TICKS_DISPLAY[idx];
  if (val === 0) return '0';
  if (val >= 1000) return `$${val / 1000}k`;
  return `$${val}`;
}

/** Pre-process data: add a `linear` field for the chart */
function toChartData(data: RevenueDataPoint[]) {
  return data.map((d) => ({ ...d, linear: toLinear(d.value) }));
}

/** Format tooltip value */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RevenueDataPoint & { linear: number } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const realValue = payload[0].payload.value ?? 0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          background: '#2D2D3A',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        {formatCurrency(realValue)}
        {/* Downward caret */}
        <span
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #2D2D3A',
          }}
        />
      </div>
    </div>
  );
};

const CustomActiveDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <circle cx={cx} cy={cy} r={5} fill='#6B21A8' stroke='white' strokeWidth={2} />
  );
};

const CustomCursor = (props: any) => {
  const { points, height } = props;
  if (!points || points.length === 0) return null;
  const { x, y } = points[0];
  return (
    <line
      x1={x}
      y1={y}
      x2={x}
      y2={y + height}
      stroke='#6B21A8'
      strokeWidth={1}
      strokeDasharray='4 4'
      opacity={0.5}
    />
  );
};

const RevenueTrends = ({ data, onPeriodChange }: RevenueTrendsProps) => {
  const [period, setPeriod] = useState('30');

  const rawData = data ?? defaultData;
  const chartData = toChartData(rawData);
  const isEmpty = chartData.length === 0;

  // Skeleton data: zero-value points for each date so the grid/axes render
  const skeletonData = EMPTY_STATE_DATES.map((date) => ({ date, value: 0, linear: 0 }));

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    onPeriodChange?.(value);
  };

  const linearTicks = Y_TICKS_DISPLAY.map((_, i) => i);

  return (
    <section className='border border-card-border rounded-2xl bg-white flex flex-col overflow-hidden'>
      {/* ── Header ── */}
      <header className='flex items-center justify-between px-5 py-4 border-b border-card-border'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-full border border-[#E3E3E3] bg-[#F5F5F5] flex items-center justify-center text-[#6B21A8]'>


            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 7.50033C9.07954 7.50033 8.33337 8.05997 8.33337 8.75033C8.33337 9.44066 9.07954 10.0003 10 10.0003C10.9205 10.0003 11.6667 10.56 11.6667 11.2503C11.6667 11.9407 10.9205 12.5003 10 12.5003M10 7.50033C10.7257 7.50033 11.343 7.84816 11.5719 8.33366M10 7.50033V6.66699M10 12.5003C9.27437 12.5003 8.65704 12.1525 8.42821 11.667M10 12.5003V13.3337" stroke="#141B34" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M17.5 9.31974V6.90057C17.5 5.5339 17.5 4.85056 17.1632 4.40473C16.8265 3.9589 16.0651 3.74246 14.5423 3.30958C13.5018 3.01383 12.5847 2.65752 11.8519 2.33223C10.8528 1.88874 10.3533 1.66699 10 1.66699C9.64667 1.66699 9.14717 1.88874 8.14809 2.33223C7.41532 2.65752 6.4982 3.01382 5.45778 3.30958C3.93494 3.74246 3.17352 3.9589 2.83676 4.40473C2.5 4.85056 2.5 5.5339 2.5 6.90057V9.31974C2.5 14.0074 6.71897 16.8199 8.82833 17.9332C9.33425 18.2002 9.58717 18.3337 10 18.3337C10.4128 18.3337 10.6657 18.2002 11.1717 17.9332C13.281 16.8199 17.5 14.0074 17.5 9.31974Z" stroke="#141B34" strokeWidth="1.25" strokeLinecap="round" />
            </svg>


          </div>
          <h3 className='font-medium text-[#1E1E1E] text-[16px]'>Revenue trends</h3>
        </div>

        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className='w-[130px] rounded-full font-medium text-[#1E1E1E] text-xs h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='30'>This Month</SelectItem>
            <SelectItem value='7'>This Week</SelectItem>
            <SelectItem value='365'>This Year</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div className='flex-1 px-2 pt-4 pb-2 relative' style={{ minHeight: 240 }}>
        {/* Always render the chart grid/axes shell */}
        <ResponsiveContainer width='100%' height={240}>
          <AreaChart
            data={isEmpty ? skeletonData : chartData}
            margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#7C3AED' stopOpacity={0.08} />
                <stop offset='95%' stopColor='#7C3AED' stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#F0F0F0'
              vertical={false}
            />

            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#9B9B9B' }}
              dy={8}
              interval={0}
            />

            <YAxis
              dataKey='linear'
              type='number'
              domain={[0, Y_TICK_COUNT - 1]}
              ticks={linearTicks}
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#9B9B9B' }}
              dx={-4}
              width={52}
            />

            {!isEmpty && (
              <Tooltip
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
                wrapperStyle={{ zIndex: 10 }}
              />
            )}

            {!isEmpty && (
              <Area
                type='monotone'
                dataKey='linear'
                stroke='#7C3AED'
                strokeWidth={2.5}
                fill='url(#revenueGradient)'
                dot={false}
                activeDot={<CustomActiveDot />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Empty state overlay — sits on top of the grid */}
        {isEmpty && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <p className='text-sm text-[#9B9B9B]'>No Data to Show yet...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RevenueTrends;