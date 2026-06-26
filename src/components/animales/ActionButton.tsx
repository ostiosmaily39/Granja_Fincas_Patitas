'use client';

import React from 'react';

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'orange' | 'green' | 'purple' | 'red';
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] shadow-sm hover:shadow',
  secondary: 'bg-white border border-black/10 text-gray-700 hover:bg-gray-50 hover:border-black/20',
  orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200',
  green: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
  purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200',
  red: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
};

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  loading = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
        variantStyles[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.97]'}`}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Icon size={16} />
      )}
      {label}
    </button>
  );
}