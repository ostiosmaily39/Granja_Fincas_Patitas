'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Save, Info } from 'lucide-react';
import { animalService } from '@/services/animalService';

interface EgressModalProps {
  isOpen: boolean;
  animal: {
    id: string;
    name: string;
    code: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EgressModal({ isOpen, animal, onClose, onSuccess }: EgressModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'vendido',
    egress_reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.egress_reason) {
        throw new Error('Debes seleccionar una razón de baja');
      }

      // Actualizar el animal
      await animalService.update(animal.id, {
        status: formData.status as 'vendido' | 'muerto' | 'descartado',
        notes: `[BAJA] ${formData.egress_reason}: ${formData.notes || 'Sin detalles adicionales'}`.trim(),
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/5 px-6 py-5 rounded-t-[2rem] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Dar de Baja</h2>
                <p className="text-xs text-gray-500">
                  {animal.name || animal.code}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ⚠️ Advertencia */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Esta acción es irreversible
              </p>
              <p className="text-xs text-amber-700">
                El animal pasará a estado inactivo y no podrá ser seleccionado en procesos activos.
              </p>
            </div>
          </div>

          {/* Estado final */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              Estado Final *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
            >
              <option value="vendido">Vendido</option>
              <option value="muerto">Muerto</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>

          {/* Razón de baja */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              Razón de Baja *
            </label>
            <select
              required
              value={formData.egress_reason}
              onChange={(e) => setFormData({ ...formData, egress_reason: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
            >
              <option value="">Seleccionar razón...</option>
              <option value="venta_animal">Venta del animal</option>
              <option value="muerte_natural">Muerte natural</option>
              <option value="sacrificio">Sacrificio</option>
              <option value="accidente">Accidente</option>
              <option value="enfermedad">Enfermedad</option>
              <option value="baja_productiva">Baja productiva</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Notas opcionales */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Detalles adicionales sobre la salida del animal..."
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors resize-none"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-black/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info size={14} className="text-red-400" />
              <span>RF009 • Control de bajas</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Confirmar Baja
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}