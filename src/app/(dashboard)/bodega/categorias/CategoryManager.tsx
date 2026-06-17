'use client';
import React, { useState } from 'react';
import { useCategories } from '@/hooks/inventory/useCategories';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { SupplyCategory, CreateSupplyCategorySchema } from '@/types/domain/inventory.schema';
import { Plus, Search, AlertCircle } from 'lucide-react';

export default function CategoryManager() {
  const { categories, loading, addCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // form state
  const [name, setName] = useState('');
  const [categoryEnum, setCategoryEnum] = useState<'alimento'|'medicamento'|'otro'>('alimento');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [errMsgs, setErrMsgs] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<SupplyCategory>[] = [
    { key: 'name', header: 'Nombre', className: 'font-bold' },
    { 
      key: 'category', 
      header: 'Clasificación', 
      render: (item) => (
        <span className={`capitalize px-3 py-1 rounded-full text-xs font-bold ${
          item.category === 'medicamento' ? 'bg-blue-50 text-blue-600' :
          item.category === 'alimento' ? 'bg-orange-50 text-orange-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {item.category}
        </span>
      )
    },
    { key: 'description', header: 'Descripción', className: 'text-gray-500' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrMsgs('');
    setFieldErrors({}); // reset before checking
    
    // Validar con Zod localmente para pintar de rojo lo que falte
    const parsed = CreateSupplyCategorySchema.safeParse({ name, category: categoryEnum, description: desc, is_active: true });
    
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      setSaving(false);
      return; // Se detiene y quedan pintados en rojo
    }

    // Si todo está bien, mandamos a BD
    try {
      await addCategory(parsed.data);
      setIsModalOpen(false);
      setName(''); setDesc(''); setCategoryEnum('alimento');
    } catch (e: any) {
      setErrMsgs(e.message || 'Ocurrió un error al guardar en base de datos');
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

  if (loading) return <div className="p-12 text-center text-gray-400 font-medium">Cargando categorías...</div>;

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-black/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setFieldErrors({}); // Limpia errores si reabres el modal
          }}
          className="bg-[var(--brand)] hover:scale-105 shrink-0 transition-transform text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-emerald-900/20"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <DataTable 
        data={filteredCategories}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage={searchQuery ? "No se encontraron categorías que coincidan." : "No hay categorías registradas."}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Categoría">
        <form onSubmit={handleCreate} className="space-y-5" noValidate>
          
          {Object.keys(fieldErrors).length > 0 && (
            <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle size={20} className="shrink-0" />
              Por favor, revisa y rellena los campos marcados en rojo.
            </div>
          )}

          {errMsgs && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{errMsgs}</div>}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Categoría</label>
            <input type="text" value={name} onChange={e => {setName(e.target.value); setFieldErrors(prev => ({...prev, name: ''}))}}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${getErrorStyle('name')}`}
              placeholder="Ej. Forrajes Secos"
            />
            {fieldErrors.name && <span className="text-red-600 text-sm font-black mt-2 flex items-center gap-1"><AlertCircle size={16}/> {fieldErrors.name}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Clasificación Principal</label>
            <select value={categoryEnum} onChange={e => {setCategoryEnum(e.target.value as any); setFieldErrors(prev => ({...prev, category: ''}))}}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${getErrorStyle('category')}`}>
              <option value="alimento">Alimento / Suplemento</option>
              <option value="medicamento">Medicamento / Biológico</option>
              <option value="otro">Otro</option>
            </select>
            {fieldErrors.category && <span className="text-red-600 text-sm font-black mt-2 flex items-center gap-1"><AlertCircle size={16}/> {fieldErrors.category}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
            <textarea value={desc} onChange={e => {setDesc(e.target.value); setFieldErrors(prev => ({...prev, description: ''}))}} rows={3}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${getErrorStyle('description')}`}
              placeholder="Ingresa detalles sobre el uso de esta categoría..."
            />
            {fieldErrors.description && <span className="text-red-600 text-sm font-black mt-2 flex items-center gap-1"><AlertCircle size={16}/> {fieldErrors.description}</span>}
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 px-4 bg-[var(--brand)] hover:brightness-95 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
