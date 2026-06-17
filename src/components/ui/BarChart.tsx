'use client';

import React from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  secondaryData?: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
  legend?: { primary: string; secondary: string };
}

export default function BarChart({ data, secondaryData, height = 250, showValues = true, legend }: BarChartProps) {
  const allValues = [...data.map(d => d.value), ...(secondaryData?.map(d => d.value) || [])];
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="flex flex-col gap-4">
      {legend && (
        <div className="flex gap-6 justify-end">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--brand)]" />
            <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-tighter">{legend.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-400" />
            <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-tighter">{legend.secondary}</span>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-2 px-2" style={{ height }}>
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
            {showValues && (
              <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value.toLocaleString()}
              </span>
            )}
            <div className="flex gap-1 items-end w-full justify-center" style={{ height: height - 30 }}>
              {/* Primary bar */}
              <div className="relative flex-1 max-w-8 bg-gray-100 rounded-t-lg overflow-hidden flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-[var(--brand)] to-[var(--brand-hover)] rounded-t-lg transition-all duration-700 group-hover:opacity-80"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              {/* Secondary bar */}
              {secondaryData && secondaryData[i] && (
                <div className="relative flex-1 max-w-8 bg-gray-100 rounded-t-lg overflow-hidden flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg transition-all duration-700 group-hover:opacity-80"
                    style={{ height: `${(secondaryData[i].value / maxValue) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
