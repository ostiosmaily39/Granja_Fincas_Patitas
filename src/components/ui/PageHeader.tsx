import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="h-12 w-12 rounded-2xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] shrink-0">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-gray-500 font-medium mt-1 max-w-xl leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
