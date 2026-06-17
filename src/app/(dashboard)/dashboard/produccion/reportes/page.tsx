import React from 'react';
import { TrendingUp, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getProductionStats } from '@/actions/production-reports.actions';
import MilkChart from '@/components/production/MilkChart';
import EggChart from '@/components/production/EggChart';
import SummaryCards from '@/components/production/SummaryCards';
import ProductionTable from '@/components/production/ProductionTable';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const days = params.days ? parseInt(params.days) : 7;
  
  const stats = await getProductionStats(days);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/produccion" className="bg-white p-2 rounded-xl text-gray-500 hover:text-[var(--brand)] shadow-sm border border-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
               <TrendingUp className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reportes de Producción</h1>
               <p className="text-gray-500 text-sm font-medium">Análisis de rendimiento y mermas</p>
             </div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
           <Link href="?days=7" className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${days === 7 ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}>Últimos 7 Días</Link>
           <Link href="?days=30" className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${days === 30 ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}>Últimos 30 Días</Link>
        </div>
      </div>

      <SummaryCards kpi={stats.kpi} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <MilkChart data={stats.milkChart} />
         <EggChart data={stats.eggChart} />
      </div>

      <ProductionTable milkChart={stats.milkChart} eggChart={stats.eggChart} />
    </div>
  );
}
