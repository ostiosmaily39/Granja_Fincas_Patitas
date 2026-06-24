'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { AnimalWithRelations, Breed, UpdateAnimalDTO } from '@/types/domain/animal.schema';
import { animalService } from '@/services/animalService';
import {
  fromDbAnimalStatus,
  fromDbHealthStatus,
  fromDbReproductiveStatus,
} from '@/lib/animals-db-map';
import { Loader2, AlertTriangle } from 'lucide-react';

interface AnimalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  animal: AnimalWithRelations;
}

type FormData = {
  name: string;
  current_weight_kg: number;
  health_status: string;
  vaccination_status: string;
  reproductive_status: string;
  status: string;
  breed_id: string;
  notes: string;
};

type Step = 'edit' | 'confirm';

type FieldChange = {
  key: string;
  label: string;
  before: string;
  after: string;
};

const FIELD_LABELS: Record<keyof FormData, string> = {
  name: 'Nombre',
  breed_id: 'Raza',
  current_weight_kg: 'Peso actual (kg)',
  health_status: 'Estado de salud',
  vaccination_status: 'Estado de vacunación',
  reproductive_status: 'Estado reproductivo',
  status: 'Estado comercial',
  notes: 'Notas',
};

const STATUS_LABELS: Record<string, string> = {
  sano: 'Sano',
  enfermo: 'Enfermo',
  en_tratamiento: 'En tratamiento',
  cuarentena: 'Cuarentena',
  cronico: 'Crónico',
  fallecido: 'Fallecido',
  al_dia: 'Al día',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
  no_aplica: 'No aplica',
  apto: 'Apto',
  gestante: 'Gestante',
  lactante: 'Lactante',
  sin_gestion_activa: 'Sin gestión activa',
  en_gestion: 'En gestión',
  en_parto: 'En parto',
  activo: 'Activo',
  vendido: 'Vendido',
  muerto: 'Muerto',
  descartado: 'Descartado',
};

function animalToFormData(animal: AnimalWithRelations): FormData {
  return {
    name: animal.name || '',
    current_weight_kg: animal.current_weight_kg || 0,
    health_status: fromDbHealthStatus(animal.health_status),
    vaccination_status: animal.vaccination_status || 'pendiente',
    reproductive_status: fromDbReproductiveStatus(animal.reproductive_status),
    status: fromDbAnimalStatus(animal.status, animal.egress_reason),
    breed_id: animal.breed_id || '',
    notes: animal.notes || '',
  };
}

function formatDisplayValue(key: keyof FormData, value: string | number, breeds: Breed[]): string {
  if (key === 'breed_id') {
    if (!value) return 'Sin raza definida';
    const breed = breeds.find((b) => b.id === value);
    return breed?.name ?? String(value);
  }
  if (key === 'current_weight_kg') return `${value} kg`;
  if (typeof value === 'string' && STATUS_LABELS[value]) return STATUS_LABELS[value];
  return String(value || '—');
}

function buildUpdatePayload(formData: FormData): UpdateAnimalDTO {
  return {
    name: formData.name || null,
    current_weight_kg: formData.current_weight_kg,
    health_status: formData.health_status as UpdateAnimalDTO['health_status'],
    vaccination_status: formData.vaccination_status as UpdateAnimalDTO['vaccination_status'],
    reproductive_status: formData.reproductive_status as UpdateAnimalDTO['reproductive_status'],
    status: formData.status as UpdateAnimalDTO['status'],
    breed_id: formData.breed_id || null,
    notes: formData.notes || null,
  };
}

function computeChanges(
  original: FormData,
  current: FormData,
  breeds: Breed[]
): FieldChange[] {
  const changes: FieldChange[] = [];

  (Object.keys(FIELD_LABELS) as (keyof FormData)[]).forEach((key) => {
    const before = original[key];
    const after = current[key];
    if (before !== after) {
      changes.push({
        key,
        label: FIELD_LABELS[key],
        before: formatDisplayValue(key, before, breeds),
        after: formatDisplayValue(key, after, breeds),
      });
    }
  });

  return changes;
}

export default function AnimalEditModal({ isOpen, onClose, onSuccess, animal }: AnimalEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('edit');
  const [breedsList, setBreedsList] = useState<Breed[]>([]);
  const [formData, setFormData] = useState<FormData>(() => animalToFormData(animal));
  const [pendingChanges, setPendingChanges] = useState<FieldChange[]>([]);
  const [pendingPayload, setPendingPayload] = useState<UpdateAnimalDTO | null>(null);

  const originalFormData = useMemo(() => animalToFormData(animal), [animal]);

  useEffect(() => {
    if (isOpen && animal.species_id) {
      animalService.getBreedsBySpecies(animal.species_id).then(setBreedsList).catch(console.error);
    }
  }, [isOpen, animal.species_id]);

  useEffect(() => {
    if (isOpen) {
      setFormData(animalToFormData(animal));
      setStep('edit');
      setPendingChanges([]);
      setPendingPayload(null);
    }
  }, [isOpen, animal]);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const changes = computeChanges(originalFormData, formData, breedsList);

    if (changes.length === 0) {
      alert('No hay cambios para guardar.');
      return;
    }

    setPendingChanges(changes);
    setPendingPayload(buildUpdatePayload(formData));
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;

    try {
      setLoading(true);
      await animalService.update(animal.id, pendingPayload);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      alert(`Error al actualizar: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('edit');
    setPendingChanges([]);
    setPendingPayload(null);
  };

  if (step === 'confirm') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Confirmar cambios" maxWidth="max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-900 font-medium">
              Revisa los cambios antes de guardar. Esta acción quedará registrada en el historial del animal.
            </p>
          </div>

          <div className="border border-black/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wider">Campo</th>
                  <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wider">Antes</th>
                  <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wider">Después</th>
                </tr>
              </thead>
              <tbody>
                {pendingChanges.map((change) => (
                  <tr key={change.key} className="border-t border-black/5">
                    <td className="px-4 py-3 font-bold text-gray-700">{change.label}</td>
                    <td className="px-4 py-3 text-gray-500">{change.before}</td>
                    <td className="px-4 py-3 text-[var(--brand)] font-semibold">{change.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Confirmar y guardar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Animal" maxWidth="max-w-3xl">
      <form onSubmit={handleReview} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✅ Campo NOMBRE - Único campo */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              NOMBRE *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del animal"
              required
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Raza
            </label>
            <select
              value={formData.breed_id}
              onChange={(e) => setFormData({ ...formData, breed_id: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="">Sin raza definida</option>
              {breedsList.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Peso Actual (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={formData.current_weight_kg}
              onChange={(e) => setFormData({ ...formData, current_weight_kg: Number(e.target.value) })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado de Salud
            </label>
            <select
              value={formData.health_status}
              onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="sano">Sano</option>
              <option value="enfermo">Enfermo</option>
              <option value="en_tratamiento">En Tratamiento</option>
              <option value="cuarentena">Cuarentena</option>
              <option value="cronico">Crónico</option>
              <option value="fallecido">Fallecido</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado de Vacunación
            </label>
            <select
              value={formData.vaccination_status}
              onChange={(e) => setFormData({ ...formData, vaccination_status: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="al_dia">Al Día</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado Reproductivo
            </label>
            <select
              value={formData.reproductive_status}
              onChange={(e) => setFormData({ ...formData, reproductive_status: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="no_aplica">No Aplica</option>
              <option value="apto">Apto</option>
              <option value="gestante">Gestante</option>
              <option value="lactante">Lactante</option>
              <option value="sin_gestion_activa">Sin Gestión Activa</option>
              <option value="en_gestion">En Gestión</option>
              <option value="en_parto">En Parto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado Comercial
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="activo">Activo</option>
              <option value="vendido">Vendido</option>
              <option value="muerto">Muerto</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
        </div>

        {/* ✅ Campo NOTAS / OBSERVACIONES */}
        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Observaciones adicionales sobre el animal..."
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
            Revisar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}