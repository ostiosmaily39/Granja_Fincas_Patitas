'use client';

import React from 'react';
import { 
  CheckSquare, 
  UtensilsCrossed, 
  Clock, 
  Heart,
  Beef,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks, mockAnimals, mockVaccinationStatus } from '@/lib/mock-data';

export default function EmpleadoDashboard() {
  const { user } = useAuth();
  
  // Calcular métricas
  const pendingTasks = mockTasks.filter(t => t.status !== 'completada').length;
  const animalsToFeed = mockAnimals.length; // asumiendo todos
  const animalsToVaccinate = mockVaccinationStatus.filter(v => v.vaccines_pending > 0).length;

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
            Gestión Diaria
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Hola, {user?.full_name || 'Empleado'}. Tienes {pendingTasks} tareas pendientes para hoy. Asegúrate de registrar tu ingreso en el módulo de turnos.
          </p>
        </div>
        
        {/* Acceso rápido a turnos (muy importante para empleados) */}
        <a href="/dashboard/empleado/turnos" className="bg-[#E4EFE4] p-6 rounded-[2rem] flex items-center gap-6 min-w-[280px] shadow-sm border border-black/5 hover:bg-[#d5e5d5] transition-colors">
          <div className="h-14 w-14 rounded-2xl bg-white/50 flex items-center justify-center text-[var(--brand)] shadow-inner">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-500 mb-1">Estado del Turno</p>
            <h3 className="text-xl font-black text-gray-800 leading-none">Fuera de Turno</h3>
            <p className="text-xs font-bold text-[var(--brand)] mt-1 opacity-70">Haz clic para registrar</p>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/dashboard/empleado/tareas" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <CheckSquare size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Tareas Diarias</h4>
              <p className="text-sm font-bold text-purple-600">{pendingTasks} pendientes</p>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/empleado/alimentacion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Alimentación</h4>
              <p className="text-sm font-bold text-orange-600">{animalsToFeed} por alimentar</p>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/empleado/salud" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Salud Animal</h4>
              <p className="text-sm font-bold text-red-500">{animalsToVaccinate} atenciones requeridas</p>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/empleado/animales" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] group-hover:scale-110 transition-transform">
              <Beef size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Animales a Cargo</h4>
              <p className="text-sm font-bold text-[var(--brand)]">Ver listado asignado</p>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/empleado/produccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Registro Producción</h4>
              <p className="text-sm font-bold text-blue-600">Leche y huevos</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
