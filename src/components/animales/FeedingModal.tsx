'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, X, Save, Info, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/utils/supabase/client';
import StockSelector from '@/components/ui/StockSelector';

interface FeedingModalProps {
  isOpen: boolean;
  animalId: string;
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

export default function FeedingModal({ isOpen, animalId, onClose, onSuccess }: FeedingModalProps) {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    supplyId: '',
    quantity: 0,
    fedAt: '',
    notes: '',
  });

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadSupplies();
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({
        ...prev,
        fedAt: now.toISOString().slice(0, 16)
      }));
    }
  }, [isOpen]);

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

  const handleSupplySelect = (supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId);
    setSelectedSupply(supply || null);
    setFormData({ ...formData, supplyId, quantity: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.supplyId) {
        throw new Error('Selecciona un insumo');
      }
      if (!formData.fedAt) {
        throw new Error('La fecha y hora del suministro es obligatoria');
      }
      if (formData.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }
      if (selectedSupply && formData.quantity > selectedSupply.current_stock) {
        throw new Error(`La cantidad no puede exceder el stock disponible (${selectedSupply.current_stock} ${selectedSupply.unit})`);
      }

      const payload = {
        animal_id: animalId,
        supply_id: formData.supplyId,
        quantity: formData.quantity,
        unit: selectedSupply?.unit || 'kg',
        fed_at: formData.fedAt,
        notes: formData.notes || null,
      };

      console.log('📦 Enviando payload:', payload);

      // ✅ URL CORRECTA: /api/animales/ (con "e")
      const response = await fetch(`/api/animales/${animalId}/alimentacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error al guardar el registro de alimentación';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Respuesta exitosa:', result);

      if (selectedSupply) {
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

  const filteredSupplies = supplies.filter(s => 
    filterCategory === 'all' || s.category_id === filterCategory
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/5 px-6 py-5 rounded-t-[2rem] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Registrar Alimentación</h2>
                <p className="text-xs text-gray-500">Registra el consumo de alimento del animal</p>
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
          {/* Selección de insumo */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              INSUMO (SOLO ALIMENTOS) *
            </label>
            <select
              required
              value={formData.supplyId}
              onChange={(e) => handleSupplySelect(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
            >
              <option value="">Seleccionar insumo...</option>
              {filteredSupplies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} · Stock: {s.current_stock} {s.unit}
                </option>
              ))}
            </select>
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
                  <span>✅ Stock disponible: {selectedSupply.current_stock} {selectedSupply.unit}</span>
                )}
              </div>
            )}
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              FECHA Y HORA DEL SUMINISTRO *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.fedAt}
              onChange={(e) => setFormData({ ...formData, fedAt: e.target.value })}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
            />
          </div>

          {/* Cantidad con selector inteligente */}
          {selectedSupply && (
            <div className="border-t border-black/5 pt-4">
              <StockSelector
                maxValue={selectedSupply.current_stock || 0}
                unit={selectedSupply.unit || 'kg'}
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
                label="Cantidad a usar"
                disabled={selectedSupply.current_stock <= 0}
              />
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              NOTAS (OPCIONAL)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Observaciones sobre la alimentación..."
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors resize-none"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-black/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info size={14} className="text-[var(--brand)]" />
              <span>RF014 • Control de alimentación</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">API REST</span>
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
                    Guardar y descontar stock
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