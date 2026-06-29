'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Milk,
  Beef,
  PackageSearch,
  CheckSquare,
  Sprout,
  PlusCircle,
  Syringe,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Bell
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { getGlobalKPIs } from '@/actions/dashboard.actions';
import { mockTasks } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function EncargadoDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({ totalAnimals: 0, criticalAlerts: 0, lowStockSupplies: 0, lastMonthMilk: 0 });
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(mockTasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignedTo: 'Ana Gómez', priority: 'media' });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getGlobalKPIs();
        setKpis(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task = {
      id: String(tasks.length + 1),
      title: newTask.title,
      description: `Tarea asignada por Encargado: ${user?.full_name}`,
      assigned_to: newTask.assignedTo,
      status: 'pendiente' as const,
      due_date: new Date().toISOString().split('T')[0],
      category: 'general' as const
    };
    setTasks([task, ...tasks]);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', assignedTo: 'Ana Gómez', priority: 'media' });
    alert('Tarea asignada con éxito a ' + task.assigned_to);
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completada');

  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-10">
      {/* 1. Cabecera */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <span className="text-xs uppercase font-extrabold text-[var(--brand)] tracking-widest bg-[#E4EFE4]/60 px-3 py-1 rounded-full">
            Panel Encargado
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mt-3">
            Gestión Operativa
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Hola, {user?.full_name || 'Encargado'}. Tienes el control total de la granja. Monitorea el ganado, insumos en bodega, reproducción y coordina las tareas del personal a tu cargo.
          </p>
        </div>
      </div>

      {/* 2. Grid de KPIs */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <StatCard
          title="Ganado Activo"
          value={kpis.totalAnimals.toLocaleString()}
          icon={Beef}
          color="brand"
          href="/dashboard/animales"
        />

        <StatCard
          title="Insumos Críticos"
          value={kpis.lowStockSupplies}
          subtitle="Stocks bajo el mínimo"
          icon={PackageSearch}
          color="orange"
          href="/dashboard/insumos"
        />

        <StatCard
          title="Alertas Salud"
          value={kpis.criticalAlerts}
          subtitle="Animales enfermos"
          icon={AlertTriangle}
          color="red"
          href="/dashboard/alertas"
        />

        <StatCard
          title="Litros Ordeñados"
          value={`${kpis.lastMonthMilk.toLocaleString()} L`}
          subtitle="Últimos 30 días"
          icon={Milk}
          color="blue"
          href="/dashboard/produccion/leche"
        />
      </div>

      {/* 3. Módulos Operativos */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6">Módulos de Operación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/dashboard/animales" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] mb-4 group-hover:scale-110 transition-transform">
              <Beef size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Inventario Pecuario</h4>
            <p className="text-sm text-gray-500 mt-2">CRUD completo de animales. Controla el ganado bovino, porcino y avícola en tiempo real.</p>
          </a>

          <a href="/dashboard/insumos" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <PackageSearch size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Insumos y Bodega</h4>
            <p className="text-sm text-gray-500 mt-2">Control de stock de alimentos y medicamentos. Registra entradas y salidas de bodega.</p>
          </a>

          <a href="/dashboard/vacunacion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Syringe size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Planes de Vacunación</h4>
            <p className="text-sm text-gray-500 mt-2">Protocolos y esquemas de vacunación. Asigna dosis periódicas a los animales.</p>
          </a>

          <a href="/dashboard/produccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Milk size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Producción Pecuaria</h4>
            <p className="text-sm text-gray-500 mt-2">Registro y seguimiento de ordeño diario de leche y recolección de huevos por lote.</p>
          </a>

          <a href="/dashboard/reproduccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
              <Sprout size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Ciclos de Reproducción</h4>
            <p className="text-sm text-gray-500 mt-2">Monitoreo de celo, inseminaciones, gestaciones y registro automático de nacimientos.</p>
          </a>

          <a href="/dashboard/personal" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Personal de Trabajo</h4>
            <p className="text-sm text-gray-500 mt-2">Supervisa a los empleados asignados a tu cargo y visualiza su estado de actividad.</p>
          </a>
        </div>
      </div>

      {/* 4. Tareas de Empleados y Alertas del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Tareas Asignadas */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <CheckSquare className="text-gray-400" size={20} /> Tareas del Personal
              </h3>
              <p className="text-xs font-bold text-gray-400 mt-1">{pendingTasks.length} tareas activas asignadas</p>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1 bg-[#E4EFE4] hover:bg-[#d5e5d5] text-[var(--brand)] px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm"
            >
              <PlusCircle size={14} /> Asignar Tarea
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[380px] overflow-y-auto pr-2">
            {pendingTasks.map((task) => (
              <div key={task.id} className="py-4 flex justify-between items-center group transition-colors">
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{task.title}</h5>
                  <p className="text-xs text-gray-400 font-bold mt-1">
                    Asignado a: <span className="text-gray-600">{task.assigned_to}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {task.status === 'en_proceso' ? (
                    <Badge variant="info" className="text-[9px] font-bold uppercase tracking-wider">En proceso</Badge>
                  ) : (
                    <Badge variant="warning" className="text-[9px] font-bold uppercase tracking-wider">Pendiente</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas del Sistema */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Bell className="text-gray-400" size={20} /> Alertas de la Sede
              </h3>
              <p className="text-xs font-bold text-gray-400 mt-1">Alertas operativas inmediatas</p>
            </div>
            <a href="/dashboard/alertas" className="text-xs font-extrabold text-[var(--brand)] hover:underline flex items-center">
              Ver todas <ChevronRight size={14} />
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-extrabold text-red-950">Atención Médica Requerida</p>
                <p className="text-xs text-red-800 font-semibold mt-1">El animal VAC-003 (Mariposa) se encuentra bajo estado de tratamiento.</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
              <PackageSearch className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-extrabold text-amber-950">Stock de Insumos Bajo</p>
                <p className="text-xs text-amber-800 font-semibold mt-1">Alimento Premium Mixto tiene 240kg restantes. Reabastecer pronto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Crear Tarea */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Asignar Nueva Tarea"
      >
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
              Título de la Actividad
            </label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Ej: Suministro de vitaminas Galpón 2"
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
              Asignar a Empleado
            </label>
            <select
              value={newTask.assignedTo}
              onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[var(--brand)] outline-none"
            >
              <option value="Ana Gómez">Ana Gómez</option>
              <option value="Pedro Ramírez">Pedro Ramírez</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm"
            >
              Confirmar Asignación
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}