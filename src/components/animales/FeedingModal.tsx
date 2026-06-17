'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { CreateFeedingDTO } from '@/types/domain/feeding.schema';
import { createClient } from '@/utils/supabase/client';
import { SupabaseFeedingRepository } from '@/repositories/supabase/FeedingRepository';
import { SupabaseInventoryRepository, Supply } from '@/repositories/supabase/InventoryRepository';
import { Loader2 } from 'lucide-react';

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface FeedingModalProps {
  isOpen: boolean;
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedingModal({ isOpen, animalId, onClose, onSuccess }: FeedingModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingSupplies, setFetchingSupplies] = useState(true);
  const [supplies, setSupplies] = useState<Supply[]>([]);

  const [feedingRepo] = useState(() => new SupabaseFeedingRepository(createClient()));
  const [inventoryRepo] = useState(() => new SupabaseInventoryRepository(createClient()));

  const [formData, setFormData] = useState<{
    supply_id?: string;
    quantity: number;
    notes: string;
    fed_at_local: string;
  }>({
    quantity: 1,
    notes: '',
    fed_at_local: toDatetimeLocalValue(new Date()),
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      quantity: 1,
      notes: '',
      fed_at_local: toDatetimeLocalValue(new Date()),
    });
    void loadSupplies();
  }, [isOpen]);

  const loadSupplies = async () => {
    try {
      setFetchingSupplies(true);
      const data = await inventoryRepo.getFoodSupplies();
      setSupplies(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, supply_id: data[0].id }));
      } else {
        setFormData((prev) => ({ ...prev, supply_id: undefined }));
      }
    } catch (error) {
      console.error('Error al cargar insumos:', error);
    } finally {
      setFetchingSupplies(false);
    }
  };

  const selectedSupply = useMemo(
    () => supplies.find((s) => s.id === formData.supply_id),
    [supplies, formData.supply_id]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.supply_id) {
        throw new Error('No hay insumos de alimentación disponibles en bodega.');
      }
      const qty = Number(formData.quantity);
      if (!Number.isFinite(qty) || qty < 0.01) {
        throw new Error('Indica una cantidad válida (mínimo 0,01).');
      }
      if (selectedSupply && qty > Number(selectedSupply.current_stock)) {
        throw new Error(
          `La cantidad supera el stock disponible (${selectedSupply.current_stock} ${selectedSupply.unit}).`
        );
      }

      const fedIso = formData.fed_at_local
        ? new Date(formData.fed_at_local).toISOString()
        : undefined;

      const payload: CreateFeedingDTO = {
        animal_id: animalId,
        supply_id: formData.supply_id,
        quantity: qty,
        notes: formData.notes.trim() || undefined,
        fed_at: fedIso,
      };

      await feedingRepo.addFeeding(payload);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar alimentación" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {fetchingSupplies ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-[var(--brand)]" />
          </div>
        ) : supplies.length === 0 ? (
          <p className="text-sm font-medium text-gray-600 p-4 bg-amber-50 rounded-xl border border-amber-100">
            No hay insumos activos en categorías de tipo <strong>alimento</strong>. Registra insumos en
            bodega (M4) o revisa categorías en la base de datos.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Insumo (solo alimentos)
              </label>
              <select
                required
                value={formData.supply_id || ''}
                onChange={(e) => setFormData({ ...formData, supply_id: e.target.value })}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                {supplies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Stock: {s.current_stock} {s.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Fecha y hora del suministro
              </label>
              <input
                type="datetime-local"
                required
                value={formData.fed_at_local}
                onChange={(e) => setFormData({ ...formData, fed_at_local: e.target.value })}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                  Cantidad
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    max={selectedSupply ? Number(selectedSupply.current_stock) : undefined}
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Number(e.target.value) })
                    }
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {selectedSupply?.unit || 'uds'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                  Se registra el consumo y se descuenta el stock en bodega (mismo movimiento contable).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ej. Corral 3, ración mañana"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-2">
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
            disabled={loading || fetchingSupplies || supplies.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar y descontar stock
          </button>
        </div>
      </form>
    </Modal>
  );
}
