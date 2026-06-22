'use client';

import React from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

interface DashboardShellProps {
  sidebar: React.ReactElement;
  header: React.ReactElement;
  children: React.ReactNode;
}

/**
 * Componente de cliente que envuelve la estructura del dashboard
 * para manejar estados interactivos como el menú lateral en móvil.
 */
export default function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar - Ahora el Sidebar mismo maneja su estado vía hook */}
      {sidebar}

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        {/* Header - Ahora el Header mismo maneja el toggle vía hook */}
        {header}

        <main className="flex-1 overflow-y-auto bg-[var(--brand-50)]/30 scroll-smooth">
          <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
