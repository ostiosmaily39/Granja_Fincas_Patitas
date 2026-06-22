'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmpleadoDashboard from './EmpleadoDashboard';
import { Loader2 } from 'lucide-react';
import { isAdministrator } from '@/lib/role-utils';

export default function DashboardPage() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isAdministrator(role)) {
    return <AdminDashboard />;
  }

  return <EmpleadoDashboard />;
}
