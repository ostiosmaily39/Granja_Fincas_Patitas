'use client';
import React, { useState } from 'react';
import { MilkProductionSchema } from '@/types/domain/production.schema';
import { createMilkRecord } from '@/actions/production.actions';
import { Save, AlertCircle } from 'lucide-react';

interface Props {
  cows: { id: string; name: string; tag_number: string }[];
  onSuccess?: () => void;
}

export default function MilkProductionForm({ cows, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener fecha local en formato YYYY-MM-DD
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawData = {
      animal_id: formData.get('animal_id'),
      date: formData.get('date') || localDate,
      shift: formData.get('shift'),
      quantity_liters: formData.get('quantity_liters'),
      notes: formData.get('notes')
    };

    const result = MilkProductionSchema.safeParse(rawData);

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Error de validación');
      setLoading(false);
      return;
    }

    const response = await createMilkRecord(result.data);
    
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
        <h3 className="text-xl font-bold text-gray-900">Registrar Ordeño</h3>
        <p className="text-sm text-gray-500 font-medium">Ingresa el volumen diario obtenido por vaca específica.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Vaca <span className="text-red-500">*</span></label>
          <select name="animal_id" required className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none">
            <option value="">Seleccione un animal...</option>
            {cows.map(cow => (
              <option key={cow.id} value={cow.id}>{cow.name} (Arete: {cow.tag_number})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Turno <span className="text-red-500">*</span></label>
          <select name="shift" required defaultValue="MAÑANA" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none">
            <option value="MAÑANA">MAÑANA</option>
            <option value="TARDE">TARDE</option>
            <option value="NOCHE">NOCHE</option>
            <option value="MAQUINARIA">MAQUINARIA (Automático)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Fecha del Registro <span className="text-red-500">*</span></label>
          <input type="date" name="date" required defaultValue={localDate} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Cantidad (Litros) <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="number" step="0.1" name="quantity_liters" required placeholder="Ej: 12.5" className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
            <span className="absolute right-4 top-3.5 text-gray-400 font-bold text-sm">L</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">Notas / Observaciones</label>
        <textarea name="notes" placeholder="Alguna observación sobre la extracción..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[100px] resize-y" />
      </div>

      <div className="pt-2">
        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
          {loading ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Registro</>}
        </button>
      </div>
    </form>
  );
}
