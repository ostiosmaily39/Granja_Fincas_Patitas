'use client';
import React, { useState } from 'react';
import { EggProductionSchema } from '@/types/domain/production.schema';
import { createEggRecord } from '@/actions/production.actions';
import { Save, AlertCircle } from 'lucide-react';

interface Props {
  batches: { id: string; name: string; quantity: number }[];
  onSuccess?: () => void;
}

export default function EggProductionForm({ batches, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener fecha local en formato YYYY-MM-DD para evitar seleccionar el día de "mañana" por UTC
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawData = {
      batch_id: formData.get('batch_id'),
      date: formData.get('date') || localDate,
      total_quantity: formData.get('total_quantity'),
      damaged_quantity: formData.get('damaged_quantity') || '0',
      notes: formData.get('notes')
    };

    const result = EggProductionSchema.safeParse(rawData);

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Error de validación');
      setLoading(false);
      return;
    }

    const response = await createEggRecord(result.data);
    
    if (response.error) {
      setError(response.error);
    } else {
      form.reset();
      if (onSuccess) onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-xl font-bold text-gray-900">Registrar Recolección</h3>
        <p className="text-sm text-gray-500 font-medium">Ingresa el total de huevos obtenidos por Lote.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Nombre del Lote <span className="text-red-500">*</span></label>
          <input type="text" name="batch_id" required placeholder="Ej: Lote A - Ponedoras" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all outline-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Fecha de Recolección <span className="text-red-500">*</span></label>
          <input type="date" name="date" required defaultValue={localDate} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all outline-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Huevos Recolectados (Total) <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="number" name="total_quantity" required placeholder="Ej: 300" className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all outline-none" />
            <span className="absolute right-4 top-3.5 text-gray-400 font-bold text-sm">Ud</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Huevos Dañados / Rotos</label>
          <div className="relative">
             <input type="number" name="damaged_quantity" defaultValue="0" placeholder="Ej: 5" className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all outline-none" />
             <span className="absolute right-4 top-3.5 text-gray-400 font-bold text-sm">Ud</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">Notas / Observaciones</label>
        <textarea name="notes" placeholder="Novedades durante la recolección..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all outline-none min-h-[100px] resize-y" />
      </div>

      <div className="pt-2">
        <button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
          {loading ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Registro</>}
        </button>
      </div>
    </form>
  );
}
