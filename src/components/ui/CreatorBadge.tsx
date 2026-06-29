import React from 'react';
import { User } from 'lucide-react';

interface CreatorBadgeProps {
  creatorName?: string | null;
  creatorRole?: string | null;
  createdAt?: string | null;
  className?: string;
}

export default function CreatorBadge({ 
  creatorName, 
  creatorRole, 
  createdAt,
  className = '' 
}: CreatorBadgeProps) {
  if (!creatorName && !creatorRole) return null;

  const getRoleColor = (role?: string | null) => {
    switch (role?.toUpperCase()) {
      case 'ADMINISTRADOR':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ENCARGADO':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'EMPLEADO':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={12} className="text-gray-500" />
        </div>
        <span className="font-semibold text-gray-700">
          {creatorName || 'Desconocido'}
        </span>
      </div>
      
      {creatorRole && (
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleColor(creatorRole)}`}>
          {creatorRole}
        </span>
      )}
      
      {createdAt && (
        <span className="text-gray-400 font-medium">
          {formatDate(createdAt)}
        </span>
      )}
    </div>
  );
}