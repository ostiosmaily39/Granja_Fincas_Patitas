'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Beef,
  PackageSearch,
  Syringe,
  Milk,
  Sprout,
  PlayCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';

export default function EmpleadoDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(mockTasks);
  const [taskFilter, setTaskFilter] = useState<'todos' | 'pendiente' | 'completada'>('todos');

  const totalTasks = tasks.length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'completada').length;

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const newStatus = t.status === 'completada' ? 'pendiente' :
            t.status === 'pendiente' ? 'en_proceso' : 'completada';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'todos') return true;
    if (taskFilter === 'pendiente') return t.status !== 'completada';
    return t.status === 'completada';
  });

  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-10">
      {/* 1. Cabecera */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <span className="text-xs uppercase font-extrabold text-[var(--brand)] tracking-widest bg-[#E4EFE4]/60 px-3 py-1 rounded-full">
            Panel Empleado
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mt-3">
            Gestión Diaria
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Hola, {user?.full_name || 'Empleado'}. Tienes {pendingTasksCount} actividades pendientes para hoy. Asegúrate de registrar tu turno de trabajo y completar tus asignaciones diarias.
          </p>
        </div>

        {/* Acceso rápido a turnos */}
        <a href="/dashboard/empleado/turnos" className="bg-[#E4EFE4] p-6 rounded-[2rem] flex items-center gap-6 min-w-[280px] shadow-sm border border-black/5 hover:bg-[#d5e5d5] transition-colors shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-white/50 flex items-center justify-center text-[var(--brand)] shadow-inner">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-500 mb-1">Estado del Turno</p>
            <h3 className="text-xl font-black text-gray-800 leading-none">Fuera de Turno</h3>
            <p className="text-xs font-bold text-[var(--brand)] mt-1 opacity-70">Haz clic para registrar</p>
          </div>
        </a>
      </div>

      {/* 2. Grid de Módulos Permitidos */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6">Módulos de Trabajo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          <a href="/dashboard/empleado/tareas" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <CheckSquare size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Tareas</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">{pendingTasksCount} pendientes hoy</p>
          </a>

          <a href="/dashboard/empleado/turnos" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Turnos</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Registrar entrada / salida</p>
          </a>

          <a href="/dashboard/animales" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] mb-4 group-hover:scale-110 transition-transform">
              <Beef size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Animales</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Ver listado y registrar nuevos</p>
          </a>

          <a href="/dashboard/insumos" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <PackageSearch size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Insumos</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Ver stock de bodega</p>
          </a>

          <a href="/dashboard/vacunacion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Syringe size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Vacunación</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Consultar esquemas de salud</p>
          </a>

          <a href="/dashboard/produccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <Milk size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Producción</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Registrar leche o huevos</p>
          </a>

          <a href="/dashboard/reproduccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
              <Sprout size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Reproducción</h4>
            <p className="text-xs text-gray-400 font-bold mt-1">Consulta de preñez y gestaciones</p>
          </a>
        </div>
      </div>

      {/* 3. Tareas Asignadas */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <CheckSquare className="text-gray-400" size={24} /> Mis Tareas Asignadas
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Revisa tus responsabilidades del día y reporta el progreso.</p>
          </div>

          {/* Filtros de tareas */}
          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-black/5 self-start">
            <button
              onClick={() => setTaskFilter('todos')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${taskFilter === 'todos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Todas ({totalTasks})
            </button>
            <button
              onClick={() => setTaskFilter('pendiente')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${taskFilter === 'pendiente' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Pendientes ({pendingTasksCount})
            </button>
            <button
              onClick={() => setTaskFilter('completada')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${taskFilter === 'completada' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Completadas ({totalTasks - pendingTasksCount})
            </button>
          </div>
        </div>

        {/* Listado */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center gap-2">
            <CheckCircle2 size={32} className="text-gray-200" />
            <p className="font-bold text-sm">No hay tareas que mostrar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-gray-50/50 p-6 rounded-[2rem] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[var(--brand)] transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${task.status === 'completada' ? 'bg-green-50 text-green-500' :
                      task.status === 'en_proceso' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                    {task.status === 'completada' ? <CheckCircle2 size={24} /> :
                      task.status === 'en_proceso' ? <PlayCircle size={24} className="animate-pulse" /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold ${task.status === 'completada' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed max-w-xl">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vence: {task.due_date}</span>
                      <span className="text-gray-300">•</span>
                      <Badge variant={task.category === 'general' ? 'neutral' : 'info'} className="text-[9px] font-bold uppercase tracking-wider px-2">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTaskStatus(task.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0 self-start sm:self-center ${task.status === 'completada' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' :
                      task.status === 'en_proceso' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
                    }`}
                >
                  {task.status === 'pendiente' ? 'Iniciar' :
                    task.status === 'en_proceso' ? 'Completar' : 'Reabrir'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota informativa sobre permisos */}
      <div className="bg-blue-50 border border-blue-200 rounded-[2rem] p-6 flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Información sobre permisos</h4>
          <p className="text-sm text-blue-800">
            Puedes crear nuevos registros en los módulos disponibles. Solo podrás editar o eliminar los registros que tú hayas creado.
            Los registros creados por el encargado o administrador son de solo lectura.
          </p>
        </div>
      </div>
    </div>
  );
}