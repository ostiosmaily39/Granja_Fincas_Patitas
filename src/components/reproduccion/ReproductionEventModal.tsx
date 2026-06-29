'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type {
  CreateReproductiveEventDTO,
  ReproductiveAnimalMini,
} from '@/types/domain/reproduction.schema';
import { labelAnimal } from '@/types/domain/reproduction.schema';
import { Loader2 } from 'lucide-react';


interface ReproductionEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfileOption {
  id: string;
  full_name: string;
  role: string;
}

const ESPECIES = [
  { value: '', label: 'Seleccionar especie…' },
  { value: '0753a97a-a184-4197-877e-9fbf96a9ffef', label: 'Vaca' },
  { value: '54d42a83-9721-4310-b824-ce803c48c886', label: 'Cerdo' },
  { value: '7535273c-720c-4da6-935a-aba86b9173a3', label: 'Gallina' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  ENCARGADO: 'Encargado',
  EMPLEADO: 'Empleado',
};

export default function ReproductionEventModal({ isOpen, onClose, onSuccess }: ReproductionEventModalProps) {
  const [repo] = useState(() => new SupabaseReproductionRepository(createClient()));
  const [loading, setLoading] = useState(false);
  const [boot, setBoot] = useState(true);
  const [females, setFemales] = useState<ReproductiveAnimalMini[]>([]);
  const [males, setMales] = useState<ReproductiveAnimalMini[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);

  const [especieFilter, setEspecieFilter] = useState('');
  const [femaleId, setFemaleId] = useState('');
  const [eventType, setEventType] = useState<'monta_natural' | 'inseminacion_artificial'>('monta_natural');
  const [eventDate, setEventDate] = useState('');
  const [maleId, setMaleId] = useState('');
  const [maleExternal, setMaleExternal] = useState('');
  const [notes, setNotes] = useState('');
  const [useExternalMale, setUseExternalMale] = useState(false);
  const [responsible, setResponsible] = useState('');

  const femalesFiltered = useMemo(() => {
    if (!especieFilter) return females;
    return females.filter((f) => f.species_id === especieFilter);
  }, [females, especieFilter]);

  const femaleSpeciesId = useMemo(() => {
    return females.find((x) => x.id === femaleId)?.species_id;
  }, [females, femaleId]);

  const malesFiltered = useMemo(() => {
    if (!femaleSpeciesId) return males;
    return males.filter((m) => m.species_id === femaleSpeciesId);
  }, [males, femaleSpeciesId]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setBoot(true);
        const supabase = createClient();
        const [f, m, { data: profilesData }] = await Promise.all([
          repo.listAnimalsBySex('hembra'),
          repo.listAnimalsBySex('macho'),
          supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('is_active', true)
            .order('full_name'),
        ]);
        setFemales(f);
        setMales(m);
        setProfiles(profilesData ?? []);
        setEventDate(new Date().toISOString().slice(0, 10));
        setFemaleId('');
        setEspecieFilter('');
        setEventType('monta_natural');
        setMaleId('');
        setMaleExternal('');
        setNotes('');
        setUseExternalMale(false);
        setResponsible('');
      } catch (e) {
        alert(`No se pudieron cargar los datos: ${(e as Error).message}`);
      } finally {
        setBoot(false);
      }
    })();
  }, [isOpen, repo]);

  useEffect(() => {
    setFemaleId('');
  }, [especieFilter]);

  useEffect(() => {
    if (!maleId) return;
    if (!malesFiltered.some((m) => m.id === maleId)) setMaleId('');
  }, [malesFiltered, maleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!especieFilter) throw new Error('Seleccione la especie.');
      if (!femaleId) throw new Error('Seleccione la hembra.');
      if (!responsible) throw new Error('Seleccione el responsable.');
      if (!eventDate) throw new Error('Indique la fecha del evento.');

      const payload: CreateReproductiveEventDTO = {
        animal_id: femaleId,
        event_type: eventType,
        event_date: eventDate,
        responsible: responsible.trim(),
        notes: notes.trim() || null,
        father_id: useExternalMale ? null : (maleId.trim() || null),
        father_external: useExternalMale ? (maleExternal.trim() || null) : null,
      };

      await repo.create(payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo evento reproductivo" maxWidth="max-w-xl">
      {boot ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--brand)] w-10 h-10" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Responsable */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Responsable *
            </label>
            <select
              required
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="" disabled>Seleccionar responsable…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.full_name}>
                  {p.full_name} — {ROLE_LABELS[p.role] ?? p.role}
                </option>
              ))}
            </select>
          </div>

          {/* Especie */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Especie *
            </label>
            <select
              required
              value={especieFilter}
              onChange={(e) => setEspecieFilter(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              {ESPECIES.map((s) => (
                <option key={s.value} value={s.value} disabled={s.value === ''}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hembra */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Hembra *
            </label>
            <select
              required
              value={femaleId}
              onChange={(e) => setFemaleId(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="">Seleccionar…</option>
              {femalesFiltered.map((a) => (
                <option key={a.id} value={a.id}>
                  {labelAnimal(a)}
                </option>
              ))}
            </select>
            {especieFilter && femalesFiltered.length === 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                No hay hembras activas de esta especie.
              </p>
            )}
          </div>

          {/* Tipo de evento y fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Tipo de evento *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as 'monta_natural' | 'inseminacion_artificial')}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                <option value="monta_natural">Monta natural</option>
                <option value="inseminacion_artificial">Inseminación artificial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Fecha del evento *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>

          {/* Padre */}
          <div className="rounded-xl border border-black/5 p-4 bg-gray-50/50 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={useExternalMale}
                onChange={(e) => {
                  setUseExternalMale(e.target.checked);
                  setMaleId('');
                  setMaleExternal('');
                }}
                className="rounded border-gray-300"
              />
              Padre externo / pajilla (texto libre)
            </label>

            {useExternalMale ? (
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Toro / lote / referencia
                </label>
                <input
                  type="text"
                  value={maleExternal}
                  onChange={(e) => setMaleExternal(e.target.value)}
                  placeholder="Ej. Semen AI-04, Toro vecino…"
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Macho (inventario, misma especie que la hembra)
                </label>
                <select
                  value={maleId}
                  onChange={(e) => setMaleId(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                >
                  {malesFiltered.map((a) => (
                    <option key={a.id} value={a.id}>
                      {labelAnimal(a)}
                    </option>
                  ))}
                </select>
                {femaleSpeciesId && malesFiltered.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    No hay machos activos de esta especie. Use padre externo o registre un macho.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
              Guardar evento
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}