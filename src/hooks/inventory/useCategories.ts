import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { SupplyCategory, CreateSupplyCategory, UpdateSupplyCategory } from '@/types/domain/inventory.schema';

export function useCategories() {
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (data: CreateSupplyCategory) => {
    const newCategory = await inventoryService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const editCategory = async (id: string, data: UpdateSupplyCategory) => {
    const updated = await inventoryService.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const removeCategory = async (id: string) => {
    await inventoryService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    addCategory,
    editCategory,
    removeCategory
  };
}
