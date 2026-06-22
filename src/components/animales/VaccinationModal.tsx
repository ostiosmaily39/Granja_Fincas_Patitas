'use client';

import React, { useState, useEffect } from 'react';
import {
  Syringe, Calendar, User, AlertCircle,
  CheckCircle, Clock, Save, X, Info,
  Users, Package
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/utils/supabase/client';

interface VaccinationModalProps {
  isOpen: boolean;
  animal: {
    id: string;
    code: string;
    name: string;
    species: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface Supply {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_price: number;
  expiry_date: string;
  supplier: string;
  batch_number: string;
  notes: string;
  is_active: boolean;
}

const VACCINE_SCHEMES = [
  'hantivirus',
  'gripe',
  'newcastle',
  'bronquitis',
  'marek',
  'rabia',
  'leptospirosis',
  'brucelosis',
  'fiebre aftosa',
  'carbunclo',
];

const UNITS = ['ml', 'dosis', 'sacos', 'kg', 'g', 'unidad'];

export default function VaccinationModal({ isOpen, animal, onClose, onSuccess }: VaccinationModalProps) {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    vaccineName: '',
    supplyId: '',
    quantity: 0,
    unit: 'ml',
    applicationDate: '',
    nextDose: '',
    responsible: '',
    notes: '',
    batch: '',
  });

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastVaccination, setLastVaccination] = useState<any>(null);
  const [isCustomVaccine, setIsCustomVaccine] = useState(false);

  useEffect(() => {
    if (isOpen && animal) {
      loadSupplies();
      loadLastVaccination();
      
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({
        ...prev,
        applicationDate: now.toISOString().slice(0, 16),
        nextDose: calculateNextDose(now.toISOString())
      }));
    }
  }, [isOpen, animal]);

  const loadSupplies = async () => {
    try {
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        console.log('📦 Insumos cargados:', data);
        setSupplies(data);
      } else {
        console.error('❌ Error cargando insumos:', error);
      }
    } catch (error) {
      console.error('Error cargando insumos:', error);
    }
  };

  const loadLastVaccination = async () => {
    try {
      const response = await fetch(`/api/animales/${animal.id}/vacunacion/ultima`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success !== false) {
          setLastVaccination(data);
        }
      }
    } catch (error) {
      console.error('Error cargando última vacunación:', error);
    }
  };

  const calculateNextDose = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  };

  const handleSupplySelect = (supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId);
    setSelectedSupply(supply || null);
    setFormData(prev => ({ 
      ...prev, 
      supplyId, 
      unit: supply?.unit || 'ml',
      quantity: 0
    }));
  };

  const handleVaccineSchemeSelect = (scheme: string) => {
    if (scheme === 'personalizado') {
      setIsCustomVaccine(true);
      setFormData(prev => ({ ...prev, vaccineName: '' }));
    } else {
      setIsCustomVaccine(false);
      setFormData(prev => ({ ...prev, vaccineName: scheme }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ Validaciones
      if (!formData.vaccineName || formData.vaccineName.trim() === '') {
        throw new Error('El nombre de la vacuna es obligatorio');
      }
      
      if (!formData.applicationDate) {
        throw new Error('La fecha de aplicación es obligatoria');
      }
      
      if (!formData.responsible || formData.responsible.trim() === '') {
        throw new Error('El responsable es obligatorio');
      }

      // Validar stock si se seleccionó insumo
      if (formData.supplyId && formData.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (selectedSupply && formData.quantity > selectedSupply.current_stock) {
        throw new Error(`Stock insuficiente. Disponible: ${selectedSupply.current_stock} ${selectedSupply.unit}`);
      }

      const payload = {
        vaccine_name: formData.vaccineName.trim(),
        supply_id: formData.supplyId || null,
        quantity_used: Number(formData.quantity) || 0,
        unit: formData.unit,
        applied_at: formData.applicationDate,
        next_dose_date: formData.nextDose || null,
        responsible: formData.responsible.trim(), // ✅ Texto editable
        notes: formData.notes || null,
        lot_number: formData.batch || null,
        dose_number: 1,
        cost: null,
      };

      console.log('📦 Enviando payload:', payload);

      const response = await fetch(`/api/animales/${animal.id}/vacunacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar la vacuna');
      }

      // ✅ Descontar stock si se usó insumo
      if (selectedSupply && formData.quantity > 0) {
        const newStock = Math.max(selectedSupply.current_stock - formData.quantity, 0);
        await supabase
          .from('supplies')
          .update({ current_stock: newStock })
          .eq('id', selectedSupply.id);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableSupplies = supplies;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/5 px-8 py-6 rounded-t-[2rem] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center">
                <Syringe className="h-7 w-7 text-[var(--brand)]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Registrar Vacuna</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="neutral">{animal?.code}</Badge>
                  <span className="text-sm font-medium text-gray-500">
                    {animal?.name} • {animal?.species}
                  </span>
                </div>
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

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Estado actual de vacunación */}
          {lastVaccination && lastVaccination.date && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Estado de vacunación</p>
                <p className="text-xs text-blue-600">
                  Esquema actual: <span className="font-bold">Al día</span> • Última dosis: {lastVaccination.date}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="success">Al día</Badge>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ESQUEMA DE VACUNACIÓN - Botones */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-black/5">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                Esquema de Vacunación (Opcional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {VACCINE_SCHEMES.map(scheme => (
                  <button
                    key={scheme}
                    type="button"
                    onClick={() => handleVaccineSchemeSelect(scheme)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                      formData.vaccineName === scheme && !isCustomVaccine
                        ? 'border-2 border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                        : 'border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {scheme}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleVaccineSchemeSelect('personalizado')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    isCustomVaccine
                      ? 'border-2 border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                      : 'border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'
                  }`}
                >
                  ✏️ Personalizado
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                💡 Selecciona un esquema predefinido o elige "Personalizado" para escribir el nombre manualmente
              </p>
            </div>

            {/* NOMBRE DE LA VACUNA */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Nombre de la Vacuna *
              </label>
              <input
                type="text"
                required
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                placeholder={isCustomVaccine ? "Escribe el nombre de la vacuna..." : "Selecciona un esquema arriba"}
                disabled={!isCustomVaccine}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors ${
                  !isCustomVaccine 
                    ? 'border-black/5 cursor-not-allowed opacity-70' 
                    : 'border-2 border-[var(--brand)] bg-white'
                }`}
              />
              {!isCustomVaccine && formData.vaccineName && (
                <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                  ✅ {formData.vaccineName}
                </p>
              )}
              {isCustomVaccine && (
                <p className="text-[10px] text-[var(--brand)] mt-1 flex items-center gap-1">
                  ✏️ Escribe el nombre de la vacuna personalizada
                </p>
              )}
            </div>

            {/* LOTE */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Número de Lote (Opcional)
              </label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                placeholder="Ej: BATCH-2026-001"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>

            {/* INSUMO UTILIZADO - Selector */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Insumo Utilizado (Opcional)
              </label>
              <select
                value={formData.supplyId}
                onChange={(e) => handleSupplySelect(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
              >
                <option value="" className="text-gray-400">
                  — Seleccionar insumo —
                </option>
                {availableSupplies.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · Stock: {s.current_stock} {s.unit}
                  </option>
                ))}
              </select>

              {availableSupplies.length === 0 && (
                <p className="text-[10px] text-yellow-600 mt-1 flex items-center gap-1">
                  ⚠️ No hay insumos registrados.
                </p>
              )}

              {selectedSupply && (
                <div className={`mt-2 p-2 rounded-lg text-xs font-bold ${
                  selectedSupply.current_stock < 1 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {selectedSupply.current_stock < 1 ? (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={14} />
                      Stock crítico: {selectedSupply.current_stock} {selectedSupply.unit} disponibles
                    </span>
                  ) : (
                    <span>✅ {selectedSupply.name} - Stock: {selectedSupply.current_stock} {selectedSupply.unit}</span>
                  )}
                </div>
              )}
            </div>

            {/* CANTIDAD Y UNIDAD */}
            {selectedSupply && (
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                  Cantidad Usada
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      placeholder="0.000"
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>
                  <div className="min-w-[100px]">
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                    >
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  💡 Stock disponible: {selectedSupply.current_stock} {selectedSupply.unit}
                </p>
              </div>
            )}

            {/* FECHA APLICACIÓN */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Fecha Aplicación *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.applicationDate}
                onChange={(e) => {
                  const date = e.target.value;
                  setFormData({ 
                    ...formData, 
                    applicationDate: date,
                    nextDose: calculateNextDose(date)
                  });
                }}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>

            {/* PRÓXIMA DOSIS */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Próxima Dosis
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.nextDose}
                  onChange={(e) => setFormData({ ...formData, nextDose: e.target.value })}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                💡 Se sugiere 15 días después de la aplicación
              </p>
            </div>

            {/* ✅ RESPONSABLE - Campo editable */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Responsable de la Aplicación *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  placeholder="Nombre del veterinario o encargado..."
                  className="w-full bg-gray-50 border border-black/5 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                💡 Escribe el nombre del responsable de la aplicación
              </p>
            </div>

            {/* NOTAS */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Observaciones adicionales (ej: reacción, lote, etc.)..."
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Info size={14} className="text-[var(--brand)]" />
                <span>RF015 • Esquema de vacunación</span>
              </div>
              <div className="w-[1px] h-4 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Syringe size={14} className="text-[var(--brand)]" />
                <span>API REST</span>
              </div>
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Registrar Vacuna
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