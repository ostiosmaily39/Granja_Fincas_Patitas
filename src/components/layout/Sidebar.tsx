'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  Tractor,
  EggFried,
  X,
  Users,
  Beef,
  PackageSearch,
  Bell,
  Activity,
  UserCheck,
  CheckSquare,
  UtensilsCrossed,
  Clock,
  Heart,
  BarChart3,
  LayoutDashboard,
  Sprout,
  Syringe,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role?: string;
}

const adminNavItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
  { name: 'Animales', href: '/dashboard/animales', icon: Beef },
  { name: 'Insumos', href: '/dashboard/insumos', icon: PackageSearch },
  { name: 'Vacunación', href: '/dashboard/vacunacion', icon: Syringe },
  { name: 'Producción', href: '/dashboard/produccion', icon: EggFried },
  { name: 'Reproducción', href: '/dashboard/reproduccion', icon: Sprout },
  { name: 'Personal', href: '/dashboard/personal', icon: UserCheck },
  { name: 'Alertas', href: '/dashboard/alertas', icon: Bell },
  { name: 'Auditoría', href: '/dashboard/auditoria', icon: Activity },
];

const encargadoNavItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Animales', href: '/dashboard/animales', icon: Beef },
  { name: 'Insumos', href: '/dashboard/insumos', icon: PackageSearch },
  { name: 'Vacunación', href: '/dashboard/vacunacion', icon: Syringe },
  { name: 'Producción', href: '/dashboard/produccion', icon: EggFried },
  { name: 'Reproducción', href: '/dashboard/reproduccion', icon: Sprout },
  { name: 'Personal', href: '/dashboard/personal', icon: UserCheck },
  { name: 'Alertas', href: '/dashboard/alertas', icon: Bell },
  { name: 'Tareas', href: '/dashboard/empleado/tareas', icon: CheckSquare },
];

const employeeNavItems: NavItem[] = [
  { name: 'Gestión Diaria', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tareas', href: '/dashboard/empleado/tareas', icon: CheckSquare },
  { name: 'Turnos', href: '/dashboard/empleado/turnos', icon: Clock },
  { name: 'Animales', href: '/dashboard/animales', icon: Beef },
  { name: 'Insumos', href: '/dashboard/insumos', icon: PackageSearch },
  { name: 'Vacunación', href: '/dashboard/vacunacion', icon: Syringe },
  { name: 'Producción', href: '/dashboard/produccion', icon: BarChart3 },
  { name: 'Reproducción', href: '/dashboard/reproduccion', icon: Sprout },
];

export default function Sidebar({ role: roleProp }: SidebarProps) {
  const pathname = usePathname();
  const { role: roleFromContext } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const role = roleProp || roleFromContext;

  const navItems = role === 'ADMINISTRADOR'
    ? adminNavItems
    : role === 'ENCARGADO'
      ? encargadoNavItems
      : employeeNavItems;

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shadow-sm transition-all`}>
        <div className="h-24 flex items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5">
              <Tractor className="h-6 w-6 text-[var(--brand)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-800 tracking-tight leading-none">Fincas y Patitas</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">
                {role === 'ADMINISTRADOR' ? 'Panel Admin' : role === 'ENCARGADO' ? 'Panel Encargado' : 'Panel Empleado'}
              </span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-8 bg-[var(--brand)] rounded-r-full" />
                )}
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-[var(--brand)]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="text-[11px] uppercase tracking-wider font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 px-6 border-t border-[var(--glass-border)] flex flex-col gap-4 bg-white/30">
          <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest opacity-60 pb-2">
            &copy; {new Date().getFullYear()} Fincas y Patitas
          </div>
        </div>
      </aside>
    </>
  );
}