import React from 'react';
import { Activity, Droplets, Egg, AlertTriangle } from 'lucide-react';

export default function SummaryCards({ kpi }: { kpi: { totalEggs: number; totalDamagedEggs: number; totalMilk: number; avgMilk: number } }) {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-CO').format(num || 0);
  const dmgPercent = kpi.totalEggs > 0 ? ((kpi.totalDamagedEggs / kpi.totalEggs) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 bg-blue-50 w-24 h-24 rounded-full blur-2xl" />
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
          <Droplets className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Leche Total</p>
          <h4 className="text-2xl font-extrabold text-gray-900">{formatNumber(kpi.totalMilk)} <span className="text-sm font-medium text-gray-400">L</span></h4>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full blur-2xl" />
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Promedio Día</p>
          <h4 className="text-2xl font-extrabold text-gray-900">{formatNumber(Math.round(kpi.avgMilk))} <span className="text-sm font-medium text-gray-400">L/día</span></h4>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 bg-amber-50 w-24 h-24 rounded-full blur-2xl" />
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
          <Egg className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Huevos Obtenidos</p>
          <h4 className="text-2xl font-extrabold text-gray-900">{formatNumber(kpi.totalEggs)} <span className="text-sm font-medium text-gray-400">Ud</span></h4>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 bg-red-50 w-24 h-24 rounded-full blur-2xl" />
        <div className="bg-gradient-to-br from-red-400 to-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Mermas (Rotos)</p>
          <h4 className="text-2xl font-extrabold text-gray-900">{formatNumber(kpi.totalDamagedEggs)} <span className="text-sm font-medium text-gray-400">({dmgPercent}%)</span></h4>
        </div>
      </div>
    </div>
  );
}
