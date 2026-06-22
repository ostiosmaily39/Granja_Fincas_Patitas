'use client';

import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Milk,
  Egg,
  Beef,
  PackageSearch,
  Activity
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { getGlobalKPIs, getAuditHistory } from '@/actions/dashboard.actions';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [kpis, setKpis] = React.useState({ totalAnimals: 0, criticalAlerts: 0, lowStockSupplies: 0, lastMonthMilk: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* 1. Cabecera */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
            Panel de Administración
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Bienvenido, {user?.full_name || 'Administrador'}. Tienes {kpis.criticalAlerts} animales marcados como enfermos y la producción de leche suma {kpis.lastMonthMilk.toLocaleString()} L en los últimos 30 días.
          </p>
        </div>
      </div>

      {/* 2. Grid de KPIs */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <StatCard 
          title="Total Animales"
          value={kpis.totalAnimals.toLocaleString()}
          icon={Beef}
          color="brand"
          href="/dashboard/animales"
        />
        
        <StatCard 
          title="Insumos Bajos"
          value={kpis.lowStockSupplies}
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
          title="Producción de Leche"
          value={`${kpis.lastMonthMilk.toLocaleString()} L`}
          subtitle="Últimos 30 días"
          icon={Milk}
          color="blue"
          href="/dashboard/produccion"
        />
      </div>

      {/* 3. Accesos Rápidos */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6">Módulos del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/dashboard/usuarios" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Personal y Usuarios</h4>
            <p className="text-sm text-gray-500 mt-2">Gestiona el acceso al sistema, roles y asignación de tareas a empleados.</p>
          </a>
          
          <a href="/dashboard/animales" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] mb-4 group-hover:scale-110 transition-transform">
              <Beef size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Inventario Pecuario</h4>
            <p className="text-sm text-gray-500 mt-2">Accede al registro completo de animales, estados de salud y encargados.</p>
          </a>
          
          <a href="/dashboard/produccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Métricas de Producción</h4>
            <p className="text-sm text-gray-500 mt-2">Visualiza el rendimiento de producción de leche y huevos con gráficos mensuales.</p>
          </a>
        </div>
      </div>

      {/* 4. Auditoría */}
      <div className="mt-4 border-t border-gray-100 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-gray-900">Seguridad Integral</h3>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <a href="/dashboard/auditoria" className="bg-gray-900 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative border border-gray-800">
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-gray-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Activity size={28} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Panel de Auditoría</h4>
                <p className="text-gray-400 text-sm max-w-sm">Monitoreo transaccional de Base de Datos (Insert/Update/Delete). Comprueba quién hizo qué cambio y en qué fecha.</p>
              </div>
              <div className="hidden md:flex items-center text-emerald-400 font-bold tracking-wide gap-3 group-hover:translate-x-2 transition-transform">
                Visualizar Logs Transversales <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
