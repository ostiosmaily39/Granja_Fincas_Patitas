import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  Sun, 
  TrendingUp, 
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* 1. Header Section & Weather */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">Resumen de la Granja</h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Bienvenido a Fincas y Patitas. Todo está funcionando correctamente hoy. Tienes 3 revisiones médicas pendientes y la producción de leche subió un 5% desde ayer.
          </p>
        </div>
        
        <div className="bg-[#E4EFE4] p-6 rounded-[2rem] flex items-center gap-6 min-w-[280px] shadow-sm border border border-black/5">
          <div className="h-14 w-14 rounded-2xl bg-white/50 flex items-center justify-center text-[var(--brand)] shadow-inner">
            <Sun className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-500 mb-1">Clima Actual</p>
            <h3 className="text-2xl font-black text-gray-800 leading-none">24°C Soleado</h3>
            <p className="text-xs font-bold text-[var(--brand)] mt-1 opacity-70">Ideal para el pastoreo</p>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Total Herd */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col gap-6 group">
          <div className="flex justify-between items-start">
            <div className="h-14 w-14 rounded-2xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">Hato Total</p>
              <div className="flex items-center gap-2 justify-end">
                <h2 className="text-4xl font-black text-gray-900">1,248</h2>
                <span className="text-xs font-bold text-[var(--brand)]">+12 esta semana</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
            <div className="text-center">
              <p className="text-sm font-black text-gray-800">450</p>
              <p className="text-[10px] uppercase font-bold text-gray-400">Vacas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-gray-800">320</p>
              <p className="text-[10px] uppercase font-bold text-gray-400">Cerdos</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-gray-800">478</p>
              <p className="text-[10px] uppercase font-bold text-gray-400">Gallinas</p>
            </div>
          </div>
        </div>

        {/* Production Stats */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col gap-8 group">
          <div className="flex justify-between items-start">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <TrendingUp size={28} />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">Producción</p>
              <h2 className="text-4xl font-black text-gray-900 leading-none">Diaria</h2>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-gray-500">Rendimiento Leche</span>
                <span className="text-gray-900">4,200 L</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--brand)] w-[85%] rounded-full" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-gray-500">Conteo de Huevos</span>
                <span className="text-gray-900">850 Unidades</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 w-[60%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col gap-6 group">
          <div className="flex justify-between items-start">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <AlertTriangle size={28} />
            </div>
            <button className="text-[10px] uppercase tracking-widest font-extrabold text-[var(--brand)] hover:underline">Gestionar Bodega</button>
          </div>
          
          <h3 className="text-xl font-black text-gray-900 -mt-2">Alertas de Stock Críticas</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-red-50/50 border border-red-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                <span className="text-lg">📦</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Alimento Premium Mixto</p>
                <p className="text-[10px] font-bold text-red-500">240kg restantes (Bajo)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                <span className="text-lg">💉</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Vacuna Lote B-12</p>
                <p className="text-[10px] font-bold text-orange-600">15 dosis restantes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trends & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Trends Chart (Simulated) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col gap-10 min-h-[500px]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-800">Tendencias de Producción</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Rendimiento últimos 7 días</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[var(--brand)]" />
                <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-tighter">Leche</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-400" />
                <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-tighter">Huevos</span>
              </div>
            </div>
          </div>

          {/* Dummy Chart Area */}
          <div className="flex-1 flex items-end justify-between px-4 pb-4">
            {[45, 60, 50, 80, 70, 90, 85].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-4 w-full group">
                <div className="relative w-8 bg-gray-100 rounded-t-xl overflow-hidden min-h-[200px] flex items-end">
                  <div 
                    className="absolute w-full bg-gradient-to-t from-[var(--brand)] to-[var(--brand-hover)] rounded-t-lg transition-all duration-1000 group-hover:opacity-80" 
                    style={{ height: `${val}%` }} 
                  />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border-l-4 border-[var(--brand)] italic text-gray-600 font-medium">
            &quot;¡Excelente rendimiento este fin de semana en Fincas y Patitas! La producción de leche superó el promedio mensual en un 12.4%.&quot;
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-2xl font-black text-gray-800">Actividad Reciente</h3>
            <button className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400 hover:text-[var(--brand)]">Auditoría Completa</button>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { title: 'Nuevo Nacimiento Registrado', label: 'GANADO', time: 'Hace 2 horas', sector: 'Sector B', icon: '🐮', color: 'bg-green-100', text: 'Vaca #882 parió un ternero macho saludable. ID de etiqueta: M-1022.' },
              { title: 'Chequeo Médico Completado', label: 'RUTINA', time: 'Hace 5 horas', sector: 'Unidad Aviar', icon: '🩺', color: 'bg-orange-100', text: 'Ronda de vacunación completada para 45 gallinas en el Galpón 4.' },
              { title: 'Entrega de Inventario', label: 'BODEGA', time: 'Ayer', sector: 'Entrada Principal', icon: '🚚', color: 'bg-gray-100', text: 'Llegada confirmada de 500kg de Silo Orgánico. Niveles restaurados.' },
              { title: 'Alerta de Ciclo Estral', label: 'GANADO', time: 'Ayer', sector: 'Sector A', icon: '❤️', color: 'bg-yellow-100', text: 'Monitores de actividad de la Vaca #441 indican pico de fertilidad.' }
            ].map((act, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)]/20 transition-all flex flex-col gap-3 group translate-x-0 hover:translate-x-2">
                <div className="flex gap-4 items-start">
                  <div className={`h-12 w-12 rounded-2xl ${act.color} flex items-center justify-center shadow-sm text-xl`}>
                    {act.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-gray-900">{act.title}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${act.color} text-gray-600 uppercase tracking-tighter`}>{act.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">{act.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 tracking-tight">{act.time} • {act.sector}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 pb-6">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">&copy; 2024 Fincas y Patitas • Sistemas de Precisión Agrícola</p>
        <div className="flex gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <button className="hover:text-[var(--brand)] transition-colors">Política de Privacidad</button>
          <button className="hover:text-[var(--brand)] transition-colors">Soporte Técnico</button>
        </div>
      </footer>
    </div>
  );
}
