'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmpleadoDashboard from './EmpleadoDashboard';
import NotificationBanner from '@/components/notifications/NotificationBanner';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <NotificationBanner />
      
      {role === 'ADMINISTRADOR' ? <AdminDashboard /> : <EmpleadoDashboard />}
    </>
  );
}