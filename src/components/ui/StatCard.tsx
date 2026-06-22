import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: 'brand' | 'orange' | 'red' | 'blue' | 'purple';
  href?: string;
}

const colorMap = {
  brand: { bg: 'bg-[#E4EFE4]/60', text: 'text-[var(--brand)]' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-500' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'brand', href }: StatCardProps) {
  const { bg, text } = colorMap[color];

  const content = (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col gap-4 group cursor-pointer">
      <div className="flex justify-between items-start">
        <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center ${text} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="text-right flex-1 ml-4">
          <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 leading-tight mt-1">{value}</h3>
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          {subtitle && <span className="text-xs font-medium text-gray-500">{subtitle}</span>}
          {trend && (
            <span className={`text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
