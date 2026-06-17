'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Species, Breed, CreateAnimalDTO } from '@/types/domain/animal.schema';
import { createClient } from '@/utils/supabase/client';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';
import { Loader2 } from 'lucide-react';

interface AnimalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnimalFormModal({ isOpen, onClose, onSuccess }: AnimalFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [breedsList, setBreedsList] = useState<Breed[]>([]);
  
  const [repo] = useState(() => new SupabaseAnimalRepository(createClient()));

  const [formData, setFormData] = useState<Partial<CreateAnimalDTO>>({
    sex: 'hembra',
    origin: 'adquirido_externo',
    health_status: 'sano',
    vaccination_status: 'pendiente',
    reproductive_status: 'no_aplica',
    status: 'activo',
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      // Reset form
      setFormData({
        sex: 'hembra',
        origin: 'adquirido_externo',
        health_status: 'sano',
        vaccination_status: 'pendiente',
        reproductive_status: 'no_aplica',
        status: 'activo',
      });
      setBreedsList([]);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const species = await repo.getSpecies();
      setSpeciesList(species);
      if (species.length > 0) {
        setFormData(prev => ({ ...prev, species_id: species[0].id }));
        loadBreeds(species[0].id);
      }
    } catch (error) {
      console.error('Error al cargar especies:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadBreeds = async (speciesId: string) => {
    try {
      const breeds = await repo.getBreedsBySpecies(speciesId);
      setBreedsList(breeds);
      if (breeds.length > 0) {
        setFormData(prev => ({ ...prev, breed_id: breeds[0].id }));
      } else {
        setFormData(prev => ({ ...prev, breed_id: undefined }));
      }
    } catch (error) {
      console.error('Error al cargar razas:', error);
    }
  };

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speciesId = e.target.value;
    setFormData(prev => ({ ...prev, species_id: speciesId }));
    loadBreeds(speciesId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.species_id || !formData.sex) {
        throw new Error("Especie y Sexo son obligatorios");
      }
      const origin = formData.origin ?? 'adquirido_externo';
      if (origin === 'nacido_en_finca' && !formData.birth_date?.trim()) {
        throw new Error('Indica la fecha de nacimiento para animales nacidos en la finca.');
      }
      const w = Number(formData.initial_weight_kg);
      if (!Number.isFinite(w) || w < 0.1) {
        throw new Error('El peso inicial es obligatorio (mínimo 0,1 kg).');
      }
      
      const payload: CreateAnimalDTO = {
        species_id: formData.species_id,
        sex: formData.sex as 'macho' | 'hembra',
        breed_id: formData.breed_id,
        name: formData.name,
        birth_date: formData.birth_date,
        acquisition_date: formData.acquisition_date,
        initial_weight_kg: w,
        current_weight_kg: formData.current_weight_kg !== undefined && formData.current_weight_kg !== null && !isNaN(Number(formData.current_weight_kg))
          ? Number(formData.current_weight_kg)
          : undefined,
        origin,
        mother_id: formData.mother_id,
        father_id: formData.father_id,
        father_external: formData.father_external,
        status: formData.status || 'activo',
        health_status: formData.health_status || 'sano',
        vaccination_status: formData.vaccination_status || 'pendiente',
        reproductive_status: formData.reproductive_status || 'no_aplica',
        notes: formData.notes
      };

      await repo.create(payload);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Animal" maxWidth="max-w-3xl">
      {initialLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--brand)]" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Especie y Raza */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Especie *</label>
              <select 
                required
                value={formData.species_id || ''} 
                onChange={handleSpeciesChange}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                {speciesList.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Raza</label>
              <select 
                value={formData.breed_id || ''} 
                onChange={e => setFormData({...formData, breed_id: e.target.value})}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                <option value="">Seleccione una raza...</option>
                {breedsList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Sexo y Nombre */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Origen *</label>
              <select
                required
                value={formData.origin ?? 'adquirido_externo'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    origin: e.target.value as 'nacido_en_finca' | 'adquirido_externo',
                  })
                }
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                <option value="adquirido_externo">Adquirido (compra / traslado)</option>
                <option value="nacido_en_finca">Nacido en la finca</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Sexo *</label>
              <select 
                required
                value={formData.sex || 'hembra'} 
                onChange={e => setFormData({...formData, sex: e.target.value as any})}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                <option value="hembra">Hembra</option>
                <option value="macho">Macho</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Nombre / Apodo (Opcional)</label>
              <input 
                type="text" 
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Lola"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>

            {/* Fechas */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Fecha de Nacimiento</label>
              <input 
                type="date" 
                value={formData.birth_date || ''}
                onChange={e => setFormData({...formData, birth_date: e.target.value})}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Fecha de Ingreso / Compra</label>
              <input 
                type="date" 
                value={formData.acquisition_date || ''}
                onChange={e => setFormData({...formData, acquisition_date: e.target.value})}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>

            {/* Pesos */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Peso inicial (kg) *</label>
              <input 
                type="number" step="0.1" min={0.1} required
                value={formData.initial_weight_kg ?? ''}
                onChange={e => setFormData({...formData, initial_weight_kg: e.target.value === '' ? undefined : Number(e.target.value)})}
                placeholder="Ej. 45"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Peso Actual (Kg)</label>
              <input 
                type="number" step="0.1"
                value={formData.current_weight_kg || ''}
                onChange={e => setFormData({...formData, current_weight_kg: Number(e.target.value)})}
                placeholder="0.0"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Genealogía (Opcional para Semovientes Fundadores)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Madre (Registrada en Sistema)</label>
                <select 
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 outline-none"
                  disabled
                  title="Funcionalidad de autocompletado en desarrollo"
                >
                  <option value="">Seleccionar madre...</option>
                </select>
              </div>
              <div>
                 <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Padre (Pajilla / Externo)</label>
                 <input 
                  type="text" 
                  value={formData.father_external || ''}
                  onChange={e => setFormData({...formData, father_external: e.target.value})}
                  placeholder="ID Toro / Nombre"
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Guardar Animal
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
