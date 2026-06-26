'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Activity, Calendar, History, Loader2, PlusCircle, Baby, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type { AnimalWithRelations } from '@/types/domain/animal.schema';
import type { ReproductiveEvent } from '@/types/domain/reproduction.schema';
import Badge from '@/components/ui/Badge';
import { calculateReproMilestones } from '@/utils/reproduction-utils';
import ReproductionMilestones from './ReproductionMilestones';

interface Props {
  animal: AnimalWithRelations;
  onOpenService: () => void;
  onSuccess: () => void;
}

function getEventTypeLabel(type: string) {
  if (type === 'monta_natural') return 'Monta natural';
  if (type === 'inseminacion_artificial') return 'Inseminación artificial';
  return type;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'monta_natural': return <Heart size={16} />;
    case 'inseminacion_artificial': return <Activity size={16} />;
    default: return <CheckCircle2 size={16} />;
  }
}

function getEventIconColor(type: string) {
  switch (type) {
    case 'monta_natural': return 'bg-pink-50 text-pink-600';
    case 'inseminacion_artificial': return 'bg-blue-50 text-blue-600';
    default: return 'bg-gray-50 text-gray-400';
  }
}

function getStatusBadge(status: string | undefined) {
  if (!status) return null;
  switch (status) {
    case 'parto_exitoso': return <Badge variant="success">Parto exitoso</Badge>;
    case 'confirmada': return <Badge variant="info">Confirmada</Badge>;
    case 'en_seguimiento': return <Badge variant="warning">En seguimiento</Badge>;
    case 'fallida': return <Badge variant="danger">Fallida</Badge>;
    default: return null;
  }
}

export default function ReproductiveTab({ animal, onOpenService, onSuccess }: Props) {
  const [events, setEvents] = useState<ReproductiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reproRepo] = useState(() => new SupabaseReproductionRepository(createClient()));

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reproRepo.listByAnimal(animal.id);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [animal.id, reproRepo]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Evento activo: el más reciente con gestación en curso
  const activeService = events.find(e =>
    e.gestation_status === 'en_seguimiento' || e.gestation_status === 'confirmada'
  );

  const milestones = activeService && animal.species?.gestation_days
    ? calculateReproMilestones(
      activeService.event_date,
      animal.species.gestation_days,
      animal.species.is_productive_milk
    )
    : [];

  const showMilestones = activeService && (
    animal.reproductive_status === 'en_gestion' ||
    animal.reproductive_status === 'gestante'
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Resumen de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center">
            <Heart className="h-6 w-6 text-pink-600 fill-pink-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1.5">Estado Reproductivo</p>
            <p className="text-lg font-black text-gray-900 capitalize leading-none">
              {animal.reproductive_status.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Calendar size={12} /> Próximo Hito Estimado
          </p>
          {showMilestones && milestones.length > 0 ? (
            <div>
              <p className="text-sm font-bold text-gray-700">
                {milestones.find(m => m.status === 'active')?.label || milestones[milestones.length - 1].label}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-0.5">
                Programado: {(milestones.find(m => m.status === 'active')?.date || milestones[milestones.length - 1].date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-400 italic">Sin hitos pendientes</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onOpenService}
            className="flex items-center gap-2 px-6 py-4 bg-pink-600 text-white rounded-[1.5rem] font-bold hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all text-sm"
          >
            <PlusCircle size={18} />
            <span>Registrar Evento (IA/Parto/Eco)</span>
          </button>
        </div>
      </div>

      {/* Timeline Visual */}
      {showMilestones && activeService && animal.species?.gestation_days && (
        <ReproductionMilestones
          milestones={milestones}
          serviceDate={activeService.event_date}
          gestationDays={animal.species.gestation_days}
        />
      )}

      {/* Historial de Eventos */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <History size={20} className="text-pink-600" /> Historial Reproductivo
          </h3>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-pink-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-400 font-bold italic">
              No hay historial reproductivo registrado para este animal.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {events.map((ev) => (
              <div key={ev.id} className="p-6 hover:bg-gray-50 transition-colors flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-xl ${getEventIconColor(ev.event_type)}`}>
                    {getEventIcon(ev.event_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-gray-900">
                        {getEventTypeLabel(ev.event_type)}
                      </h4>
                      {getStatusBadge(ev.gestation_status)}
                    </div>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">
                      {ev.father_id || ev.father_external
                        ? `Padre: ${ev.father_external || 'Macho granja'}`
                        : ''}
                    </p>
                    {ev.notes && (
                      <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-lg italic">
                        &quot;{ev.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                    {new Date(ev.event_date).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-widest">
                    {ev.responsible}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}