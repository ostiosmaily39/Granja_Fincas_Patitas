'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { CreateHealthEventInput } from '@/types/domain/health.schema';
import { healthService } from '@/services/healthService';
import { Loader2 } from 'lucide-react';

interface HealthEventModalProps {
  isOpen: boolean;
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HealthEventModal({
  isOpen,
  animalId,
  onClose,
  onSuccess,
}: HealthEventModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateHealthEventInput>>({
    event_type: 'enfermedad',
    detected_at: new Date().toISOString().split('T')[0],
    recovery_status: 'en_tratamiento',
    description: '',
  });

  const [addTreatment, setAddTreatment] = useState(false);
  const [treatment, setTreatment] = useState({
    medication_name: '',
    dose: '',
    responsible: '',
    applied_at: '',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      event_type: 'enfermedad',
      detected_at: today,
      recovery_status: 'en_tratamiento',
      description: '',
      diagnosis: '',
      notes: '',
    });
    setAddTreatment(false);
    setTreatment({
      medication_name: '',
      dose: '',
      responsible: '',
      applied_at: today,
      notes: '',
    });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.description?.trim()) throw new Error('La descripción es obligatoria');

      if (addTreatment) {
        if (!treatment.medication_name.trim()) {
          throw new Error('Indica el medicamento o desactiva el bloque de tratamiento.');
        }
        if (!treatment.responsible.trim()) {
          throw new Error('Indica el responsable del tratamiento.');
        }
      }

      const treatments =
        addTreatment && treatment.medication_name.trim()
          ? [
              {
                medication_name: treatment.medication_name.trim(),
                dose: treatment.dose.trim() || undefined,
                applied_at: (treatment.applied_at || formData.detected_at!).trim(),
                responsible: treatment.responsible.trim(),
                notes: treatment.notes.trim() || undefined,
              },
            ]
          : undefined;

      await healthService.registerEvent(animalId, {
        animal_id: animalId,
        event_type: formData.event_type!,
        detected_at: formData.detected_at!,
        description: formData.description!.trim(),
        diagnosis: formData.diagnosis?.trim() || undefined,
        recovery_status: formData.recovery_status ?? 'en_tratamiento',
        notes: formData.notes?.trim() || undefined,
        treatments,
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al registrar evento: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar evento de salud" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Tipo de evento
            </label>
            <select
              required
              value={formData.event_type}
              onChange={(e) =>
                setFormData({ ...formData, event_type: e.target.value as CreateHealthEventInput['event_type'] })
              }
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="enfermedad">Enfermedad</option>
              <option value="accidente">Accidente</option>
              <option value="lesion">Lesión</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Fecha de detección
            </label>
            <input
              type="date"
              required
              value={formData.detected_at}
              onChange={(e) => {
                const d = e.target.value;
                setFormData({ ...formData, detected_at: d });
                setTreatment((t) => ({ ...t, applied_at: t.applied_at || d }));
              }}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Descripción
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ej. Cojera en pata trasera derecha, decaimiento"
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado de recuperación
            </label>
            <select
              value={formData.recovery_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recovery_status: e.target.value as CreateHealthEventInput['recovery_status'],
                })
              }
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="en_tratamiento">En tratamiento</option>
              <option value="recuperado">Recuperado</option>
              <option value="cronico">Crónico</option>
              <option value="fallecido">Fallecido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Diagnóstico (opcional)
            </label>
            <input
              type="text"
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Ej. Pododermatitis"
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Notas internas (opcional)
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="rounded-2xl border border-black/5 bg-gray-50/80 p-4 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addTreatment}
              onChange={(e) => setAddTreatment(e.target.checked)}
              className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <span className="text-sm font-black text-gray-800">Registrar tratamiento aplicado</span>
          </label>
          {addTreatment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Medicamento
                </label>
                <input
                  type="text"
                  value={treatment.medication_name}
                  onChange={(e) => setTreatment({ ...treatment, medication_name: e.target.value })}
                  placeholder="Ej. Penicilina G benzatina"
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Dosis / esquema
                </label>
                <input
                  type="text"
                  value={treatment.dose}
                  onChange={(e) => setTreatment({ ...treatment, dose: e.target.value })}
                  placeholder="Ej. 5 ml IM"
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Fecha de aplicación
                </label>
                <input
                  type="date"
                  value={treatment.applied_at || formData.detected_at || ''}
                  onChange={(e) => setTreatment({ ...treatment, applied_at: e.target.value })}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  value={treatment.responsible}
                  onChange={(e) => setTreatment({ ...treatment, responsible: e.target.value })}
                  placeholder="Veterinario o encargado"
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Notas del tratamiento
                </label>
                <input
                  type="text"
                  value={treatment.notes}
                  onChange={(e) => setTreatment({ ...treatment, notes: e.target.value })}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm font-medium"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
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
            Guardar evento
          </button>
        </div>
      </form>
    </Modal>
  );
}
