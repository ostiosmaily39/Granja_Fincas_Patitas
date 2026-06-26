'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import {
  Bell, AlertCircle, Loader2, Wheat, Package, RefreshCw,
} from 'lucide-react';
import { SupabaseInventoryRepository } from '@/repositories/supabase/InventoryRepository';
import { createClient } from '@/utils/supabase/client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StockAlertRow {
  id: string;
  supply_id: string;
  supply_name: string;
  alert_type: 'stock_bajo' | 'stock_agotado' | 'proximo_vencer' | 'vencido';
  current_value: number;
  threshold_value: number;
  unit: string;
  created_at: string;
}

interface FoodAlertRow {
  id: string;
  alert_type: 'stock_bajo' | 'stock_agotado' | 'proximo_vencer' | 'vencido';
  supply_id: string;
  supply_name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  expiry_date: string | null;
  weekly_consumption: number;
  created_at: string;
}

async function apiRequest<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Error ${res.status}`);
  return json as T;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  stock_bajo: 'Stock bajo',
  stock_agotado: 'Sin stock',
  proximo_vencer: 'Próximo a vencer',
  vencido: 'Vencido',
};

const ALERT_VARIANTS: Record<string, 'danger' | 'warning' | 'neutral'> = {
  stock_agotado: 'danger',
  vencido: 'danger',
  stock_bajo: 'warning',
  proximo_vencer: 'warning',
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AlertasPage() {
  const [repo] = useState(() => new SupabaseInventoryRepository(createClient()));

  // ── Alertas de inventario general (las que ya existían) ──
  const [stockAlerts, setStockAlerts] = useState<StockAlertRow[]>([]);
  const [stockAlertsLoading, setStockAlertsLoading] = useState(true);
  const [stockAlertsError, setStockAlertsError] = useState<string | null>(null);

  const loadStockAlerts = useCallback(async () => {
    try {
      setStockAlertsLoading(true);
      setStockAlertsError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          id, alert_type, current_value, threshold_value, created_at,
          supplies ( id, name, unit )
        `)
        .eq('status', 'activa')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      const rows = (data ?? []).map((a: any) => ({
        id: a.id,
        supply_id: a.supplies?.id ?? '',
        supply_name: a.supplies?.name ?? '—',
        unit: a.supplies?.unit ?? '',
        alert_type: a.alert_type,
        current_value: Number(a.current_value),
        threshold_value: Number(a.threshold_value),
        created_at: a.created_at,
      }));
      setStockAlerts(rows);
    } catch (e: unknown) {
      setStockAlertsError(e instanceof Error ? e.message : 'No se pudieron cargar las alertas.');
    } finally {
      setStockAlertsLoading(false);
    }
  }, []);

  useEffect(() => { void loadStockAlerts(); }, [loadStockAlerts]);

  // ── Alertas de alimentos (RF028) ──
  const [foodAlerts, setFoodAlerts] = useState<FoodAlertRow[]>([]);
  const [foodAlertsLoading, setFoodAlertsLoading] = useState(true);
  const [foodAlertsError, setFoodAlertsError] = useState<string | null>(null);

  const loadFoodAlerts = useCallback(async () => {
    try {
      setFoodAlertsLoading(true);
      setFoodAlertsError(null);
      const { data } = await apiRequest<{ data: FoodAlertRow[] }>('/api/supplies/alerts/food');
      setFoodAlerts(data);
    } catch (e: unknown) {
      setFoodAlertsError(e instanceof Error ? e.message : 'No se pudieron cargar las alertas de alimentos.');
    } finally {
      setFoodAlertsLoading(false);
    }
  }, []);

  useEffect(() => { void loadFoodAlerts(); }, [loadFoodAlerts]);

  const handleRefresh = () => {
    void loadStockAlerts();
    void loadFoodAlerts();
  };

  const totalAlerts = stockAlerts.length + foodAlerts.length;

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">

        <PageHeader
          title="Alertas"
          description="Monitoreo de stock bajo, vencimientos y alertas de alimentos para el ganado."
          icon={Bell}
          actions={
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
            >
              <RefreshCw size={15} />
              Actualizar
            </button>
          }
        />

        {/* ── Resumen ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total alertas</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalAlerts}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sin stock</p>
            <p className="text-2xl font-black text-red-500 mt-1">
              {stockAlerts.filter(a => a.alert_type === 'stock_agotado').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Stock bajo</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {stockAlerts.filter(a => a.alert_type === 'stock_bajo').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Vencimientos</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {stockAlerts.filter(a => ['proximo_vencer', 'vencido'].includes(a.alert_type)).length}
            </p>
          </div>
        </div>

        {/* ── Alertas de inventario general ── */}
        <div className="bg-white rounded-[1.5rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <Package size={18} className="text-gray-400" />
            <h2 className="font-extrabold text-gray-900">Inventario general</h2>
            {stockAlerts.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-black px-2.5 py-1 rounded-full">
                {stockAlerts.length}
              </span>
            )}
          </div>

          {stockAlertsError && (
            <div className="mx-6 my-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {stockAlertsError}
            </div>
          )}

          {stockAlertsLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : stockAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <AlertCircle size={32} className="text-gray-200" />
              <p className="font-bold text-sm">Sin alertas activas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stockAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm">{a.supply_name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {new Date(a.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500">
                      {a.current_value} / {a.threshold_value} {a.unit}
                    </span>
                    <Badge variant={ALERT_VARIANTS[a.alert_type] ?? 'neutral'}>
                      {ALERT_TYPE_LABELS[a.alert_type] ?? a.alert_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Alertas de alimentos (RF028) ── */}
        <div className="bg-white rounded-[1.5rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <Wheat size={18} className="text-amber-500" />
            <h2 className="font-extrabold text-gray-900">Alimentos para ganado</h2>
            {foodAlerts.length > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full">
                {foodAlerts.length}
              </span>
            )}
          </div>

          {foodAlertsError && (
            <div className="mx-6 my-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {foodAlertsError}
            </div>
          )}

          {foodAlertsLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : foodAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Wheat size={32} className="text-gray-200" />
              <p className="font-bold text-sm">Sin alertas de alimentos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {foodAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-extrabold text-gray-900 text-sm">{a.supply_name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      Stock: {a.current_stock} / mín. {a.min_stock} {a.unit}
                      {a.weekly_consumption > 0 && ` · consumo 7 días: ${a.weekly_consumption} ${a.unit}`}
                      {a.expiry_date && ` · vence: ${a.expiry_date}`}
                    </p>
                  </div>
                  <Badge variant={ALERT_VARIANTS[a.alert_type] ?? 'neutral'}>
                    {ALERT_TYPE_LABELS[a.alert_type] ?? a.alert_type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </RoleGuard>
  );
}