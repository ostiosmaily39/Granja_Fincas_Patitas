'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { AnimalWithRelations, Breed } from '@/types/domain/animal.schema';
import { createClient } from '@/utils/supabase/client';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';
import { Loader2 } from 'lucide-react';

interface AnimalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  animal: AnimalWithRelations;
}

export default function AnimalEditModal({ isOpen, onClose, onSuccess, animal }: AnimalEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [repo] = useState(() => new SupabaseAnimalRepository(createClient()));
  const [breedsList, setBreedsList] = useState<Breed[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    current_weight_kg: 0,
    health_status: 'sano',
    vaccination_status: 'pendiente',
    reproductive_status: 'no_aplica',
    status: 'activo',
    breed_id: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && animal.species_id) {
      loadBreeds(animal.species_id);
    }
  }, [isOpen, animal]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: animal.name || '',
        current_weight_kg: animal.current_weight_kg || 0,
        health_status: animal.health_status || 'sano',
        vaccination_status: animal.vaccination_status || 'pendiente',
        reproductive_status: animal.reproductive_status || 'no_aplica',
        status: animal.status || 'activo',
        breed_id: animal.breed_id || '',
        notes: animal.notes || '',
      });
    }
  }, [isOpen, animal]);

  const loadBreeds = async (speciesId: string) => {
    try {
      const breeds = await repo.getBreedsBySpecies(speciesId);
      setBreedsList(breeds);
    } catch (error) {
      console.error('Error al cargar razas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updatePayload = {
        name: formData.name || null,
        current_weight_kg: formData.current_weight_kg,
        health_status: formData.health_status as any,
        vaccination_status: formData.vaccination_status as any,
        reproductive_status: formData.reproductive_status as any,
        status: formData.status as any,
        breed_id: formData.breed_id || null,
        notes: formData.notes || null,
      };

      await repo.update(animal.id, updatePayload);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Animal" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Nombre / Apodo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Lola"
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Raza
            </label>
            <select
              value={formData.breed_id}
              onChange={e => setFormData({ ...formData, breed_id: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="">Sin raza definida</option>
              {breedsList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
              onChange={e => setFormData({ ...formData, current_weight_kg: Number(e.target.value) })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Estado de Salud
            </label>
            <select
              value={formData.health_status}
              onChange={e => setFormData({ ...formData, health_status: e.target.value as any })}
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
              onChange={e => setFormData({ ...formData, vaccination_status: e.target.value as any })}
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
              onChange={e => setFormData({ ...formData, reproductive_status: e.target.value as any })}
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
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="activo">Activo</option>
              <option value="vendido">Vendido</option>
              <option value="muerto">Muerto</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar Cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}