'use client';
import React, { useState, useMemo } from 'react';
import { useSupplies } from '@/hooks/inventory/useSupplies';
import { useCategories } from '@/hooks/inventory/useCategories';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Supply, CreateSupplySchema } from '@/types/domain/inventory.schema';
import { Plus, AlertTriangle, Search, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SupplyManager() {
  const { supplies, loading: loadingSupplies, addSupply } = useSupplies();
  const { categories, loading: loadingCategories } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [unitPrice, setUnitPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [supplier, setSupplier] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [errMsgs, setErrMsgs] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = { name: cat.name, type: cat.category };
      return acc;
    }, {} as Record<string, { name: string, type: string }>);
  }, [categories]);

  const filteredSupplies = supplies.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (categoryMap[s.category_id]?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Supply>[] = [
    { key: 'name', header: 'Nombre', className: 'font-bold' },
    { 
      key: 'category_id', 
      header: 'Categoría', 
      render: (item) => <span className="text-gray-600">{categoryMap[item.category_id]?.name || 'N/A'}</span>
    },
    { 
      key: 'current_stock', 
      header: 'Stock Actual', 
      render: (item) => {
        const isLow = item.current_stock <= item.min_stock;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
              {item.current_stock} {item.unit}
            </span>
            {isLow && <div title="Stock por debajo del mínimo" className="inline-flex"><AlertTriangle size={16} className="text-red-500" /></div>}
          </div>
        );
      }
    },
    { 
      key: 'expiry_date', 
      header: 'Vencimiento',
      render: (item) => {
        if (!item.expiry_date) return <span className="text-gray-400">-</span>;
        const isExpiring = new Date(item.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span className={isExpiring ? 'text-red-500 font-bold' : 'text-gray-600'}>
            {new Date(item.expiry_date).toLocaleDateString()}
          </span>
        );
      }
    }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrMsgs('');
    setFieldErrors({}); // Reinicia
    
    // Preparar payload
    const payload: any = {
        name,
        category_id: categoryId,
        unit,
        min_stock: minStock ? parseFloat(minStock) : 0,
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
        expiry_date: expiryDate || null,
        supplier: supplier || null,
        is_active: true,
        registered_by: '00000000-0000-0000-0000-000000000000' 
    };

    // Validar con schema Zod
    const parsed = CreateSupplySchema.safeParse(payload);
    const errors: Record<string, string> = {};
    
    if (!parsed.success) {
      parsed.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
    }

    if (categoryId && categoryMap[categoryId]?.type === 'medicamento' && !expiryDate) {
      errors['expiry_date'] = 'Campo obligatorio para biológicos y medicamentos';
    }

    if (!categoryId) {
      errors['category_id'] = 'Requerido';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaving(false);
      return; // Detiene el guardado y muestra los campos rojos
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await addSupply({
        ...parsed.data!,
        registered_by: session?.user?.id || "00000000-0000-0000-0000-000000000000"
      });
      setIsModalOpen(false);
      setName(''); setCategoryId(''); setUnit('');
      setMinStock('0'); setUnitPrice(''); setExpiryDate(''); setSupplier('');
    } catch (e: any) {
      setErrMsgs(e.message || 'Error grave al guardar el insumo en base de datos');
    } finally {
      setSaving(false);
    }
  };

  const getErrorStyle = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      return 'border-red-500 bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500';
    }
    return 'border-gray-200 bg-white focus:border-[var(--brand)] focus:ring-[var(--brand)]/20';
  };

  const loading = loadingSupplies || loadingCategories;
  if (loading) return <div className="p-12 text-center text-gray-400 font-medium">Cargando inventario...</div>;

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-black/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setFieldErrors({}); // reset when opening
          }}
          className="bg-[var(--brand)] hover:scale-105 shrink-0 transition-transform text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-emerald-900/20"
        >
          <Plus size={20} />
          Registrar Insumo
        </button>
      </div>

      <DataTable 
        data={filteredSupplies}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage={searchQuery ? "No se encontraron insumos que coincidan." : "El inventario está vacío."}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Insumo" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          {Object.keys(fieldErrors).length > 0 && (
            <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold border border-red-200 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              Por favor, corrige los campos obligatorios remarcados en rojo intenso antes de continuar.
            </div>
          )}

          {errMsgs && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{errMsgs}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
              <input type="text" value={name} onChange={e => {setName(e.target.value); setFieldErrors(prev => ({...prev, name: ''}))}}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('name')}`} placeholder="Ej. Concentrado Lactancia" />
              {fieldErrors.name && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.name}</span>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
              <select value={categoryId} onChange={e => {setCategoryId(e.target.value); setFieldErrors(prev => ({...prev, category_id: ''}))}}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('category_id')}`}>
                <option value="">Seleccione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fieldErrors.category_id && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.category_id}</span>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Unidad Medida</label>
              <input type="text" value={unit} onChange={e => {setUnit(e.target.value); setFieldErrors(prev => ({...prev, unit: ''}))}}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('unit')}`} placeholder="Lt, Kg, Dosis" />
              {fieldErrors.unit && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.unit}</span>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Stock Mínimo</label>
              <input type="number" step="0.01" value={minStock} onChange={e => {setMinStock(e.target.value); setFieldErrors(prev => ({...prev, min_stock: ''}))}}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('min_stock')}`} />
              {fieldErrors.min_stock && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.min_stock}</span>}
            </div>

            {categoryId && categoryMap[categoryId]?.type === 'medicamento' && (
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Vencimiento <span className="text-red-500">* (Req. en biológicos)</span></label>
                <input type="date" value={expiryDate} onChange={e => {setExpiryDate(e.target.value); setFieldErrors(prev => ({...prev, expiry_date: ''}))}}
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('expiry_date')}`} />
                {fieldErrors.expiry_date && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.expiry_date}</span>}
              </div>
            )}
            
            {(!categoryId || categoryMap[categoryId]?.type !== 'medicamento') && (
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Vencimiento (Opcional)</label>
                <input type="date" value={expiryDate} onChange={e => {setExpiryDate(e.target.value); setFieldErrors(prev => ({...prev, expiry_date: ''}))}}
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('expiry_date')}`} />
              </div>
            )}
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Proveedor (Opcional)</label>
              <input type="text" value={supplier} onChange={e => {setSupplier(e.target.value); setFieldErrors(prev => ({...prev, supplier: ''}))}}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-colors ${getErrorStyle('supplier')}`} placeholder="Nombre de la marca o tienda" />
              {fieldErrors.supplier && <span className="text-red-600 text-sm font-black mt-1 flex items-center gap-1"><AlertCircle size={14}/> {fieldErrors.supplier}</span>}
            </div>
          </div>
          
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 px-4 bg-red-600 hover:brightness-95 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50">
              {saving ? 'Validando...' : 'Revisar y Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
