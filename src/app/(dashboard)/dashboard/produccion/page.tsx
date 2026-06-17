import React from 'react';
import Link from 'next/link';
import { Milk, EggFried, Activity, TrendingUp } from 'lucide-react';

export default function ProductionHubPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Módulo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[var(--brand)]">Producción</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl text-lg">
          Registra y monitorea el rendimiento diario de tus productos terminados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {/* Leche Card */}
        <Link href="/dashboard/produccion/leche" className="group rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform">
              <Milk className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Producción <br/>Lechera</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Registra los litros individuales por vaca en sus respectivos turnos de ordeño.
            </p>
            <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide gap-2 group-hover:translate-x-1 transition-transform">
              Ir al Registro <Activity className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Huevos Card */}
        <Link href="/dashboard/produccion/huevos" className="group rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-50 rounded-full blur-3xl group-hover:bg-amber-100 transition-colors" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-6 group-hover:scale-110 transition-transform">
              <EggFried className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Producción <br/>Avícola</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Captura las cubetas y unidades de huevos por lotes, incluyendo desglose de daños.
            </p>
            <div className="flex items-center text-amber-600 font-bold text-sm tracking-wide gap-2 group-hover:translate-x-1 transition-transform">
              Ir al Registro <Activity className="w-4 h-4" />
            </div>
          </div>
        </Link>
        
        {/* Reportes Card */}
        <Link href="/dashboard/produccion/reportes" className="group rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 rounded-full blur-3xl group-hover:bg-purple-100 transition-colors" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportes <br/>Consolidados</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Gráficas y balances de la eficiencia productiva de la granja. Análisis de Fase 6.
            </p>
            <div className="flex items-center text-purple-600 font-bold text-sm tracking-wide gap-2 group-hover:translate-x-1 transition-transform">
              Ver Gráficas <Activity className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
