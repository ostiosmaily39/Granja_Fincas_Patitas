import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { ReproMilestone, getGestationProgress } from '@/utils/reproduction-utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReproductionMilestonesProps {
  milestones: ReproMilestone[];
  serviceDate: string | Date;
  gestationDays: number;
}

export default function ReproductionMilestones({ 
  milestones, 
  serviceDate, 
  gestationDays 
}: ReproductionMilestonesProps) {
  const progress = getGestationProgress(serviceDate, gestationDays);

  return (
    <div className="bg-white rounded-[2rem] border border-black/5 p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-black text-gray-900">Línea de Tiempo de Gestación</h4>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Progreso Estimado: {progress}%
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-[var(--brand)]">
          <Calendar size={20} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-100 rounded-full mb-10 overflow-hidden shadow-inner">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {milestones.map((m) => (
          <div 
            key={m.id}
            className={`relative p-4 rounded-2xl border transition-all ${
              m.status === 'overdue' 
                ? 'bg-red-50/50 border-red-100' 
                : m.status === 'active'
                ? 'bg-amber-50/50 border-amber-100 shadow-md scale-[1.02]'
                : 'bg-gray-50/30 border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                m.status === 'overdue' ? 'bg-red-100 text-red-600' :
                m.status === 'active' ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {m.status === 'overdue' ? <AlertCircle size={16} /> :
                 m.status === 'active' ? <Clock size={16} /> :
                 <CheckCircle2 size={16} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                m.status === 'overdue' ? 'bg-red-200 text-red-700' :
                m.status === 'active' ? 'bg-amber-200 text-amber-700' :
                'bg-gray-200 text-gray-500'
              }`}>
                {m.status === 'overdue' ? 'Vencido / Hoy' :
                 m.status === 'active' ? 'Pendiente / Pronto' :
                 'Programado'}
              </span>
            </div>
            
            <h5 className="font-black text-gray-800 text-sm mb-1">{m.label}</h5>
            <p className="text-lg font-black text-gray-900 mb-2">
              {format(m.date, "d 'de' MMMM", { locale: es })}
            </p>
            <p className="text-[10px] leading-tight font-medium text-gray-400">
              {m.description}
            </p>

            {m.status === 'active' && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-blue-700 leading-tight">
          Estas fechas son estimadas. El estado real del animal prevalece sobre el cálculo matemático. 
          Al registrar un Diagnóstico o Parto real, el ciclo se actualizará.
        </p>
      </div>
    </div>
  );
}
