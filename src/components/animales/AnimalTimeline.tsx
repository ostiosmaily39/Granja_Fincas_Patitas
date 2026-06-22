'use client';

import React from 'react';
import {
  Heart,
  Syringe,
  Utensils,
  LogIn,
  RefreshCw,
  Baby,
  Package,
  LogOut,
  AlertCircle,
  ClipboardList,
  Activity,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { AnimalEvent, AnimalEventType } from '@/types/domain/health.schema';

function eventIcon(type: AnimalEventType) {
  const map: Record<AnimalEventType, React.ReactNode> = {
    salud: <Heart size={20} />,
    vacunacion: <Syringe size={20} />,
    alimentacion: <Utensils size={20} />,
    ingreso: <LogIn size={20} />,
    actualizacion: <RefreshCw size={20} />,
    reproductivo: <Baby size={20} />,
    parto: <Baby size={20} />,
    produccion: <Package size={20} />,
    egreso: <LogOut size={20} />,
    correccion: <AlertCircle size={20} />,
  };
  return map[type] ?? <ClipboardList size={20} />;
}

function eventStyles(type: AnimalEventType): string {
  if (type === 'salud') return 'bg-red-50 text-red-600';
  if (type === 'vacunacion') return 'bg-emerald-50 text-emerald-600';
  if (type === 'alimentacion') return 'bg-orange-50 text-orange-600';
  if (type === 'egreso') return 'bg-gray-100 text-gray-600';
  return 'bg-blue-50 text-blue-600';
}

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function healthMetaLine(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const parts: string[] = [];
  const diag = metadata.diagnosis;
  if (typeof diag === 'string' && diag.trim()) parts.push(`Diagnóstico: ${diag}`);
  const rs = metadata.recovery_status;
  if (typeof rs === 'string' && rs.trim()) parts.push(`Recuperación: ${rs.replace(/_/g, ' ')}`);
  return parts.length ? parts.join(' · ') : null;
}

export default function AnimalTimeline({
  events,
  loading,
}: {
  events: AnimalEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Activity className="animate-spin text-[var(--brand)] w-10 h-10" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-16 text-center text-gray-400 font-bold">
        No hay eventos en el historial integral. Los registros de salud, vacunación y
        alimentación aparecerán aquí cuando existan.
      </div>
    );
  }

  return (
    <div className="divide-y divide-black/5">
      {events.map((ev) => {
        const metaLine = ev.event_type === 'salud' ? healthMetaLine(ev.metadata) : null;
        return (
          <div
            key={ev.id}
            className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="flex gap-4 min-w-0">
              <div
                className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${eventStyles(ev.event_type)}`}
              >
                {eventIcon(ev.event_type)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="neutral" dot>
                    {ev.event_type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="font-black text-gray-900 leading-snug">{ev.title}</span>
                </div>
                {ev.description && (
                  <p className="text-gray-600 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                    {ev.description}
                  </p>
                )}
                {metaLine && (
                  <p className="text-xs text-gray-500 mt-2 font-medium">{metaLine}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 md:min-w-[140px]">
              <p className="font-bold text-gray-900 text-sm">{formatEventDate(ev.event_date)}</p>
              {ev.reference_table && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  ref: {ev.reference_table}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
