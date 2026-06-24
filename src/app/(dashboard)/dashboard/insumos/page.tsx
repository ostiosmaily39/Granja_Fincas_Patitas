'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import {
  PackageSearch, Plus, AlertCircle, Loader2, Search, ChevronDown, Activity,
  Pencil, History, ArrowRightLeft, FileBarChart, Wheat, X,
} from 'lucide-react';
import {
  SupabaseInventoryRepository,
  SupplyListRow,
  SupplyCategoryRow,
  InventorySearchParams,
} from '@/repositories/supabase/InventoryRepository';
import { createClient } from '@/utils/supabase/client';
import CreatorBadge from '@/components/ui/CreatorBadge';

// ─── RF022-RF028: capa REST nueva (no toca lo de arriba) ──────────────────────

interface StockMovementRow {
  id: string;
  movement_type: 'entrada' | 'salida' | 'ajuste';
  reason: string;
  quantity: number;
  balance_before: number;
  balance_after: number;
  animal_code: string | null;
  reference_number: string | null;
  notes: string | null;
  registered_by: string | null;
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

interface SupplyReportData {
  period: { from: string; to: string };
  total_supplies: number;
  total_valuation: number;
  expiring_soon: { id: string; name: string; expiry_date: string | null }[];
  expired: { id: string; name: string; expiry_date: string | null }[];
  consumption_by_category: { category: string; total: number }[];
}

const REASON_LABELS: Record<string, string> = {
  compra: 'Compra',
  consumo_animal: 'Consumo animal',
  tratamiento_veterinario: 'Tratamiento veterinario',
  vacunacion: 'Vacunación',
  vencido: 'Vencido',
  perdida: 'Pérdida',
  devolucion: 'Devolución',
  ajuste_inventario: 'Ajuste de inventario',
  otro: 'Otro',
};

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Error ${res.status} al comunicarse con el servidor.`);
  }
  return json as T;
}

// ─── Tipos internos de filtros ────────────────────────────────────────────────

interface SupplyFilters {
  search: string;
  category: string;
  expiryStatus: string;
  stockStatus: string;
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InsumosPage() {
  const [repo] = useState(() => new SupabaseInventoryRepository(createClient()));

  const [supplies, setSupplies] = useState<SupplyListRow[]>([]);
  const [categories, setCategories] = useState<SupplyCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState<SupplyFilters>({
    search: '',
    category: 'all',
    expiryStatus: 'all',
    stockStatus: 'all',
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const handleGlobalSearch = (event: Event) => {
      const term = (event as CustomEvent).detail.term as string;
      setSearchInput(term);
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, []);

  useEffect(() => {
    repo.listSupplyCategories()
      .then(setCategories)
      .catch(console.error);
  }, [repo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.expiryStatus, filters.stockStatus]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const params: InventorySearchParams = {
        page: currentPage,
        limit: pageSize,
        sort: sortKey,
        order: sortDirection,
        search: filters.search || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        expiryStatus: filters.expiryStatus !== 'all' ? filters.expiryStatus : undefined,
        stockStatus: filters.stockStatus !== 'all' ? filters.stockStatus : undefined,
      };

      const result = await repo.searchSupplies(params);
      setSupplies(result.data);
      setTotalRecords(result.total);
      setTotalPages(result.totalPages);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Error al cargar datos');
      setSupplies([]);
    } finally {
      setLoading(false);
    }
  }, [repo, currentPage, pageSize, sortKey, sortDirection, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const lowStockCount = supplies.filter(s => s.current_stock <= s.min_stock).length;

  // ─── RF022-RF028: estado de la capa REST nueva ────────────────────────────

  const [activeTab, setActiveTab] = useState<'inventario' | 'reporte'>('inventario');

  const [foodAlerts, setFoodAlerts] = useState<FoodAlertRow[]>([]);
  const [foodAlertsLoading, setFoodAlertsLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const loadFoodAlerts = useCallback(async () => {
    try {
      setFoodAlertsLoading(true);
      const { data } = await apiRequest<{ data: FoodAlertRow[] }>('/api/supplies/alerts/food');
      setFoodAlerts(data);
    } catch (e) {
      console.error('Error al cargar alertas de alimentos:', e);
    } finally {
      setFoodAlertsLoading(false);
    }
  }, []);

  useEffect(() => { void loadFoodAlerts(); }, [loadFoodAlerts]);

  const [report, setReport] = useState<SupplyReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  const loadReport = useCallback(async () => {
    try {
      setReportLoading(true);
      setReportError(null);
      const params = new URLSearchParams();
      if (reportFrom) params.set('from', reportFrom);
      if (reportTo) params.set('to', reportTo);
      const { data } = await apiRequest<{ data: SupplyReportData }>(
        `/api/supplies/report${params.toString() ? `?${params}` : ''}`
      );
      setReport(data);
      setReportFrom(data.period.from);
      setReportTo(data.period.to);
    } catch (e: unknown) {
      setReportError(e instanceof Error ? e.message : 'No se pudo cargar el reporte.');
    } finally {
      setReportLoading(false);
    }
  }, [reportFrom, reportTo]);

  useEffect(() => {
    if (activeTab === 'reporte' && !report) void loadReport();
  }, [activeTab, report, loadReport]);

  const [editTarget, setEditTarget] = useState<SupplyListRow | null>(null);
  const [editConfirmed, setEditConfirmed] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', unit: '', min_stock: 0, unit_price: '' as string, expiry_date: '' });

  const openEditModal = (s: SupplyListRow) => {
    setEditTarget(s);
    setEditConfirmed(false);
    setEditError(null);
    setEditForm({
      name: s.name,
      unit: s.unit,
      min_stock: s.min_stock,
      unit_price: s.unit_price != null ? String(s.unit_price) : '',
      expiry_date: s.expiry_date ?? '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editConfirmed) {
      setEditError('Debes confirmar el cambio antes de guardar.');
      return;
    }
    try {
      setEditSaving(true);
      setEditError(null);
      await apiRequest(`/api/supplies/${editTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name,
          unit: editForm.unit,
          min_stock: Number(editForm.min_stock),
          unit_price: editForm.unit_price.trim() ? Number(editForm.unit_price) : null,
          expiry_date: editForm.expiry_date.trim() || null,
        }),
      });
      setEditTarget(null);
      await Promise.all([loadData(), loadFoodAlerts()]);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally {
      setEditSaving(false);
    }
  };

  const [stockTarget, setStockTarget] = useState<SupplyListRow | null>(null);
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<{ id: string; code: string; name: string | null }[]>([]);
  const [stockForm, setStockForm] = useState({
    movement_type: 'entrada' as 'entrada' | 'salida',
    quantity: '' as string,
    reason: 'compra',
    animal_id: '',
    activity: '',
    reference_number: '',
    supplier: '',
  });

  const openStockModal = (s: SupplyListRow) => {
    setStockTarget(s);
    setStockError(null);
    setStockForm({
      movement_type: 'entrada', quantity: '', reason: 'compra',
      animal_id: '', activity: '', reference_number: '', supplier: '',
    });
    if (animals.length === 0) {
      const sb = createClient();
      void (async () => {
        try {
          const { data } = await sb
            .from('animals')
            .select('id, code, name')
            .eq('status', 'activo')
            .order('code');
          setAnimals((data ?? []) as { id: string; code: string; name: string | null }[]);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }

  async function handleStockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stockTarget) return;
    const qty = Number(stockForm.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setStockError('Ingresa una cantidad mayor a cero.');
      return;
    }
    try {
      setStockSaving(true);
      setStockError(null);
      await apiRequest(`/api/supplies/${stockTarget.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          movement_type: stockForm.movement_type,
          quantity: qty,
          reason: stockForm.reason,
          animal_id: stockForm.movement_type === 'salida' && stockForm.animal_id ? stockForm.animal_id : null,
          notes: stockForm.activity.trim() || null,
          reference_number: stockForm.reference_number.trim() || null,
          supplier: stockForm.supplier.trim() || null,
        }),
      });
      setStockTarget(null);
      await Promise.all([loadData(), loadFoodAlerts()]);
    } catch (err: unknown) {
      setStockError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.');
    } finally {
      setStockSaving(false);
    }
  }

  const [historyTarget, setHistoryTarget] = useState<SupplyListRow | null>(null);
  const [historyRows, setHistoryRows] = useState<StockMovementRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const openHistoryModal = async (s: SupplyListRow) => {
    setHistoryTarget(s);
    setHistoryRows([]);
    setHistoryError(null);
    try {
      setHistoryLoading(true);
      const { data } = await apiRequest<{ data: StockMovementRow[] }>(`/api/supplies/${s.id}/movements`);
      setHistoryRows(data);
    } catch (err: unknown) {
      setHistoryError(err instanceof Error ? err.message : 'No se pudo cargar el historial.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = (_format: 'csv' | 'excel') => {
    const headers = ['Código', 'Nombre', 'Categoría', 'Stock', 'Unidad', 'Stock Mín.', 'Precio Unit.', 'Vencimiento'];
    const rows = supplies.map(s => [
      s.code, s.name, s.category_name,
      s.current_stock, s.unit, s.min_stock,
      s.unit_price ?? '—', s.expiry_date ?? '—',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `insumos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const resetForm = () => {
    setName(''); setBatchNumber(''); setCurrentStock(0);
    setMinStock(0); setUnit(''); setExpiryDate(''); setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSaving(true);
      if (!categoryId) throw new Error('Selecciona una categoría.');
      await repo.createSupply({
        name, category_id: categoryId, unit,
        current_stock: Number(currentStock),
        min_stock: Number(minStock),
        expiry_date: expiryDate.trim() || null,
        batch_number: batchNumber.trim() || null,
      });
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<SupplyListRow>[] = [
    {
  key: 'name',
  header: 'Insumo',
  sortable: true,
  render: (s) => (
    <div className="flex flex-col gap-2">
      {/* Badge del creador - ARRIBA A LA IZQUIERDA */}
      <CreatorBadge 
        creatorName={s.created_by_name}
        creatorRole={s.created_by_role}
        createdAt={s.created_at}
      />
      
      {/* Nombre del insumo */}
      <span className="font-extrabold text-gray-900">{s.name}</span>
      {/* Código */}
      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">
        {s.code}
      </span>
    </div>
  ),
},
    {
      key: 'category',
      header: 'Categoría',
      sortable: false,
      render: (s) => (
        <span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">
          {s.category_name}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Inventario actual',
      sortable: true,
      render: (s) => {
        const isLow = s.current_stock <= s.min_stock;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black text-lg ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
              {s.current_stock.toLocaleString('es-CO', { minimumFractionDigits: 3 })}
            </span>
            <span className="text-xs font-bold text-gray-400">{s.unit}</span>
            {isLow && <AlertCircle size={14} className="text-red-500 ml-1" />}
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Precio unit.',
      sortable: false,
      render: (s) => (
        <span className="font-medium text-gray-600">
          {s.unit_price != null ? `$${s.unit_price.toFixed(2)}` : '—'}
        </span>
      ),
    },

    {
      key: 'expiry',
      header: 'Vencimiento',
      sortable: true,
      render: (s) => {
        if (!s.expiry_date) return <Badge variant="neutral">—</Badge>;
        const diffDays = Math.ceil(
          (new Date(s.expiry_date).getTime() - Date.now()) / 86_400_000
        );
        const variant = diffDays < 0 ? 'danger' : diffDays <= 30 ? 'danger' : diffDays <= 90 ? 'warning' : 'success';
        return <Badge variant={variant} dot>{s.expiry_date}</Badge>;
      },
    },
    {
      key: 'stock_status',
      header: 'Estado stock',
      sortable: false,
      render: (s) => {
        if (s.current_stock === 0) return <Badge variant="danger">Agotado</Badge>;
        if (s.current_stock <= s.min_stock) return <Badge variant="warning">Stock bajo</Badge>;
        return <Badge variant="success">Disponible</Badge>;
      },
    },
    {
      key: 'created_at',
      header: 'Registrado',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-medium text-gray-400">
          {new Date(s.created_at).toLocaleDateString('es-CO')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      sortable: false,
      render: (s) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Editar insumo"
            onClick={() => openEditModal(s)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            title="Registrar movimiento de stock"
            onClick={() => openStockModal(s)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[var(--brand)] transition-colors"
          >
            <ArrowRightLeft size={15} />
          </button>
          <button
            type="button"
            title="Ver historial"
            onClick={() => openHistoryModal(s)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <History size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">

        <PageHeader
          title="Gestión de insumos"
          description="Controla el inventario de alimentos, medicamentos y suministros. Los altas quedan en bodega (M4) y el código se genera automáticamente."
          icon={PackageSearch}
          actions={
            <button
              type="button"
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Plus size={18} />
              <span>Nuevo insumo</span>
            </button>
          }
        />

        {loadError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {loadError}
          </div>
        )}

        {/* ── Banner de alertas de alimentos (RF028) ── */}
        {!foodAlertsLoading && foodAlerts.length > 0 && !bannerDismissed && (
          <div className="bg-amber-50 border border-amber-200 rounded-[1.5rem] px-5 py-4 flex items-start gap-3">
            <Wheat size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-amber-900 text-sm">
                {foodAlerts.length} alerta{foodAlerts.length !== 1 ? 's' : ''} de alimentos
              </p>
              <div className="mt-2 space-y-1.5">
                {foodAlerts.slice(0, 4).map((a) => (
                  <p key={a.id} className="text-xs font-bold text-amber-800">
                    {a.supply_name}
                    {' — '}
                    {a.alert_type === 'stock_agotado' && 'sin stock'}
                    {a.alert_type === 'stock_bajo' && `stock bajo (${a.current_stock}/${a.min_stock} ${a.unit})`}
                    {a.alert_type === 'proximo_vencer' && 'próximo a vencer'}
                    {a.alert_type === 'vencido' && 'vencido'}
                    {a.weekly_consumption > 0 && ` · consumo últimos 7 días: ${a.weekly_consumption} ${a.unit}`}
                  </p>
                ))}
                {foodAlerts.length > 4 && (
                  <p className="text-xs font-bold text-amber-700">y {foodAlerts.length - 4} más…</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Pestañas ── */}
        <div className="flex items-center gap-2 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-colors ${activeTab === 'inventario'
              ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Inventario actual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reporte')}
            className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-1.5 ${activeTab === 'reporte'
              ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <FileBarChart size={14} />
            Reporte
          </button>
        </div>

        {activeTab === 'reporte' ? (
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-black/5 space-y-6">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Desde</label>
                <input
                  type="date" value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="bg-gray-50 border border-black/5 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Hasta</label>
                <input
                  type="date" value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="bg-gray-50 border border-black/5 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[var(--brand)]"
                />
              </div>
              <button
                type="button"
                onClick={() => loadReport()}
                disabled={reportLoading}
                className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
              >
                {reportLoading && <Loader2 size={14} className="animate-spin" />}
                Actualizar
              </button>
            </div>

            {reportError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {reportError}
              </div>
            )}

            {reportLoading && !report ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : report ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Insumos activos</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{report.total_supplies}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Valorización total</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">
                      ${report.total_valuation.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Próximos a vencer</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{report.expiring_soon.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Vencidos</p>
                    <p className="text-2xl font-black text-red-500 mt-1">{report.expired.length}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-900 mb-3">
                    Consumo por categoría ({report.period.from} a {report.period.to})
                  </h3>
                  {report.consumption_by_category.length === 0 ? (
                    <p className="text-sm font-medium text-gray-400">Sin salidas de stock registradas en el período.</p>
                  ) : (
                    <div className="space-y-2">
                      {report.consumption_by_category.map((c) => (
                        <div key={c.category} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                          <span className="font-bold text-gray-700 text-sm">{c.category}</span>
                          <span className="font-black text-gray-900">{c.total.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(report.expiring_soon.length > 0 || report.expired.length > 0) && (
                  <div>
                    <h3 className="font-extrabold text-gray-900 mb-3">Artículos por vencimiento</h3>
                    <div className="space-y-2">
                      {report.expired.map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-2.5 bg-red-50 rounded-xl">
                          <span className="font-bold text-red-900 text-sm">{s.name}</span>
                          <Badge variant="danger">Vencido: {s.expiry_date}</Badge>
                        </div>
                      ))}
                      {report.expiring_soon.map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-2.5 bg-amber-50 rounded-xl">
                          <span className="font-bold text-amber-900 text-sm">{s.name}</span>
                          <Badge variant="warning">Vence: {s.expiry_date}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <>
            {/* ── Panel de filtros (mismo patrón que AnimalesPage) ── */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-black/5 space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                  className="bg-gray-50 border border-black/5 rounded-xl px-4 py-2.5 font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filters.expiryStatus}
                  onChange={(e) => setFilters(f => ({ ...f, expiryStatus: e.target.value }))}
                  className="bg-gray-50 border border-black/5 rounded-xl px-4 py-2.5 font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                >
                  <option value="all">Todos los vencimientos</option>
                  <option value="vigente">Vigente</option>
                  <option value="proximo">Por vencer (90 días)</option>
                  <option value="vencido">Vencido</option>
                </select>

                <div />
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => setFilters(f => ({ ...f, stockStatus: e.target.value }))}
                    className="bg-gray-50 border border-black/5 rounded-xl px-4 py-2 font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors text-sm"
                  >
                    <option value="all">Todos los stocks</option>
                    <option value="normal">Stock normal</option>
                    <option value="bajo">Stock bajo</option>
                  </select>
                </div>

                <div className="flex items-center gap-6 px-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-gray-900 leading-none mt-1">
                      {loading ? '—' : totalRecords}
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      Stock bajo <AlertCircle size={12} className="text-red-400 ml-1" />
                    </span>
                    <span className={`text-xl font-black leading-none mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {loading ? '—' : lowStockCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabla ── */}
            <DataTable
              columns={columns}
              data={supplies}
              keyExtractor={(s) => s.id}
              emptyMessage="No se encontraron insumos."
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              onExport={handleExport}
              loading={loading}
            />
          </>
        )}

        {/* ── Modal nuevo insumo ── */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setFormError(null); }}
          title="Registrar insumo"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Nombre del insumo
              </label>
              <input
                type="text" required minLength={2} value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="Ej. Concentrado engorde"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Categoría
              </label>
              <select
                required value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[var(--brand)] outline-none"
                disabled={categories.length === 0}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  No hay categorías. Ejecuta el SQL de supply_categories.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Lote / referencia (opcional)
              </label>
              <input
                type="text" value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="Ej. 51541"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Stock inicial
              </label>
              <input
                type="number" step="0.001" min={0} required value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Stock mínimo (alerta)
              </label>
              <input
                type="number" step="0.001" min={0} required value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Puede ser mayor que el stock inicial (solo dispara alerta visual).
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Unidad de medida
              </label>
              <input
                type="text" required value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="kg, sacos, dosis, litros…"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Fecha vencimiento
              </label>
              <input
                type="date" value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Obligatoria si la categoría es medicamento.
              </p>
            </div>

            {formError && (
              <div className="md:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {formError}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setFormError(null); }}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Guardar insumo
              </button>
            </div>
          </form>
        </Modal>

        {/* ── Modal editar insumo (RF023) ── */}
        <Modal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          title={editTarget ? `Editar: ${editTarget.name}` : 'Editar insumo'}
          maxWidth="max-w-xl"
        >
          {editTarget && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Nombre</label>
                <input
                  type="text" required minLength={2} value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Unidad</label>
                  <input
                    type="text" required value={editForm.unit}
                    onChange={(e) => setEditForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Stock mínimo</label>
                  <input
                    type="number" step="0.001" min={0} required value={editForm.min_stock}
                    onChange={(e) => setEditForm(f => ({ ...f, min_stock: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Precio unitario</label>
                  <input
                    type="number" step="0.01" min={0} value={editForm.unit_price}
                    onChange={(e) => setEditForm(f => ({ ...f, unit_price: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Vencimiento</label>
                  <input
                    type="date" value={editForm.expiry_date}
                    onChange={(e) => setEditForm(f => ({ ...f, expiry_date: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-medium">
                El stock actual ({editTarget.current_stock} {editTarget.unit}) no se edita aquí — usa &quot;Registrar movimiento&quot; para entradas o salidas.
              </p>

              <label className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox" checked={editConfirmed}
                  onChange={(e) => setEditConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs font-bold text-amber-800">
                  Confirmo que quiero guardar estos cambios sobre {editTarget.name}.
                </span>
              </label>

              {editError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" onClick={() => setEditTarget(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={editSaving || !editConfirmed}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-50"
                >
                  {editSaving && <Loader2 size={16} className="animate-spin" />}
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* ── Modal movimiento de stock (RF024/RF025) ── */}
        <Modal
          isOpen={!!stockTarget}
          onClose={() => setStockTarget(null)}
          title={stockTarget ? `Movimiento de stock: ${stockTarget.name}` : 'Movimiento de stock'}
          maxWidth="max-w-xl"
        >
          {stockTarget && (
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div className="flex gap-2">
                {(['entrada', 'salida'] as const).map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => setStockForm(f => ({ ...f, movement_type: t, reason: t === 'entrada' ? 'compra' : 'consumo_animal' }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${stockForm.movement_type === t
                      ? t === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {t === 'entrada' ? 'Entrada' : 'Salida'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Cantidad</label>
                  <input
                    type="number" step="0.001" min={0.001} required value={stockForm.quantity}
                    onChange={(e) => setStockForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    placeholder={stockTarget.unit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Motivo</label>
                  <select
                    value={stockForm.reason}
                    onChange={(e) => setStockForm(f => ({ ...f, reason: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  >
                    {Object.entries(REASON_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {stockForm.movement_type === 'salida' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                      Animal asociado (opcional)
                    </label>
                    <select
                      value={stockForm.animal_id}
                      onChange={(e) => setStockForm(f => ({ ...f, animal_id: e.target.value }))}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    >
                      <option value="">Sin animal específico</option>
                      {animals.map((a) => (
                        <option key={a.id} value={a.id}>{a.code}{a.name ? ` — ${a.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                      Actividad (si no hay animal específico)
                    </label>
                    <input
                      type="text" value={stockForm.activity}
                      onChange={(e) => setStockForm(f => ({ ...f, activity: e.target.value }))}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                      placeholder="Ej. Limpieza de corrales, jornada de vacunación…"
                    />
                  </div>
                </>
              )}

              {stockForm.movement_type === 'entrada' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">N.º factura/remisión</label>
                    <input
                      type="text" value={stockForm.reference_number}
                      onChange={(e) => setStockForm(f => ({ ...f, reference_number: e.target.value }))}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Proveedor</label>
                    <input
                      type="text" value={stockForm.supplier}
                      onChange={(e) => setStockForm(f => ({ ...f, supplier: e.target.value }))}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    />
                  </div>
                </div>
              )}

              {stockError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                  {stockError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" onClick={() => setStockTarget(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={stockSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-60"
                >
                  {stockSaving && <Loader2 size={16} className="animate-spin" />}
                  Registrar
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* ── Modal historial (RF026) ── */}
        <Modal
          isOpen={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          title={historyTarget ? `Historial: ${historyTarget.name}` : 'Historial de movimientos'}
          maxWidth="max-w-3xl"
        >
          {historyError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 mb-4">
              {historyError}
            </div>
          )}
          {historyLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : historyRows.length === 0 ? (
            <p className="text-sm font-medium text-gray-400 py-6 text-center">
              Sin movimientos registrados para este insumo.
            </p>
          ) : (
            <div className="space-y-2">
              {historyRows.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {REASON_LABELS[m.reason] ?? m.reason}
                      {m.animal_code && <span className="text-gray-400 font-medium"> · {m.animal_code}</span>}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(m.created_at).toLocaleString('es-CO')}
                      {m.registered_by ? ` · ${m.registered_by}` : ''}
                      {m.notes ? ` · ${m.notes}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={m.movement_type === 'entrada' ? 'success' : 'danger'}>
                      {m.movement_type === 'entrada' ? '+' : '−'}{m.quantity}
                    </Badge>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      {m.balance_before} → {m.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>

      </div>
    </RoleGuard>
  );
}