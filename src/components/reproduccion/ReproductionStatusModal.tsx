'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type { ReproductiveEventWithRelations } from '@/types/domain/reproduction.schema';
import type { GestationStatus } from '@/types/domain/reproduction.schema';
import { Loader2 } from 'lucide-react';

interface ReproductionStatusModalProps {
  isOpen: boolean;
  event: ReproductiveEventWithRelations | null;
  onClose: () => void;
  onSuccess: () => void;
}

function crossTitle(ev: ReproductiveEventWithRelations) {
  const f = ev.female_animal?.code || 'Hembra';
  const m = ev.male_animal?.code ?? ev.father_external ?? '—';
  return `${f} × ${m}`;
}

export default function ReproductionStatusModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}: ReproductionStatusModalProps) {
  const [repo] = useState(() => new SupabaseReproductionRepository(createClient()));
  const [loading, setLoading] = useState(false);
  const [gestationStatus, setGestationStatus] = useState<GestationStatus>('en_seguimiento');
  const [failureReason, setFailureReason] = useState('');
  const [estimatedFrom, setEstimatedFrom] = useState('');
  const [estimatedTo, setEstimatedTo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!event) return;
    setGestationStatus(event.gestation_status ?? 'en_seguimiento');
    setEstimatedFrom(event.estimated_delivery_date?.slice(0, 10) ?? '');
    setEstimatedTo((event as any).estimated_delivery_date_to?.slice(0, 10) ?? '');
    setFailureReason('');
    setNotes(event.notes ?? '');
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar rango de fechas
    if (estimatedFrom && estimatedTo && estimatedTo < estimatedFrom) {
      alert('La fecha "Hasta" no puede ser anterior a la fecha "Desde".');
      return;
    }

    try {
      setLoading(true);
      await repo.update(event.id, {
        gestation_status: gestationStatus,
        failure_reason: gestationStatus === 'fallida' ? failureReason.trim() || null : null,
        estimated_delivery_date: estimatedFrom.trim() || null,
        estimated_delivery_date_to: estimatedTo.trim() || null,
        notes: notes.trim() || null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar estado de gestación" maxWidth="max-w-lg">
      <div className="mb-5 rounded-xl bg-gray-50 border border-black/5 px-4 py-3">
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Cruce</p>
        <p className="font-black text-gray-900">{crossTitle(event)}</p>
        <p className="text-xs text-gray-500 mt-1">
          Fecha: {new Date(event.event_date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} · Tipo: {event.event_type === 'monta_natural' ? 'Monta natural' : 'Inseminación artificial'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Estado de gestación */}
        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Estado de gestación *
          </label>
          <select
            value={gestationStatus}
            onChange={(e) => setGestationStatus(e.target.value as GestationStatus)}
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
          >
            <option value="en_seguimiento">En seguimiento</option>
            <option value="confirmada">Confirmada</option>
            <option value="fallida">Fallida</option>
            <option value="parto_exitoso">Parto exitoso</option>
          </select>
        </div>

        {/* Motivo del fallo */}
        {gestationStatus === 'fallida' && (
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Motivo del fallo
            </label>
            <input
              type="text"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Ej. Aborto espontáneo, enfermedad..."
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        {/* Rango de parto estimado */}
        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Parto estimado — rango de fechas
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1">Desde</label>
              <input
                type="date"
                value={estimatedFrom}
                onChange={(e) => setEstimatedFrom(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1">Hasta</label>
              <input
                type="date"
                value={estimatedTo}
                min={estimatedFrom || undefined}
                onChange={(e) => setEstimatedTo(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>
          {estimatedFrom && estimatedTo && (
            <p className="text-xs text-emerald-600 font-medium mt-1.5">
              Rango: {new Date(estimatedFrom + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} → {new Date(estimatedTo + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
          />
        </div>


        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}