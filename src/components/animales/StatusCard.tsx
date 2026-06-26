'use client';

import React from 'react';

interface StatusCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
}

const statusColors = {
  success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
};

const statusDots = {
  success: '🟢',
  warning: '🟡',
  danger: '🔴',
  neutral: '⚪',
};

export function StatusCard({ label, value, icon: Icon, status, onClick }: StatusCardProps) {
  const displayValue = value
    ?.replace(/_/g, ' ')
    ?.replace(/\b\w/g, (char) => char.toUpperCase()) || '—';
  
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all ${statusColors[status]} ${
        isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''
      } flex items-center gap-3`}
    >
      <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-white/60">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider opacity-60 truncate">
          {label}
        </p>
        <p className="font-bold text-sm truncate flex items-center gap-1.5">
          <span className="text-xs">{statusDots[status]}</span>
          {displayValue}
        </p>
      </div>
    </div>
  );
}