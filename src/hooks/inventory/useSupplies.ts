import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { Supply, CreateSupply, UpdateSupply } from '@/types/domain/inventory.schema';

export function useSupplies(categoryId?: string) {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = categoryId 
        ? await inventoryService.getSuppliesByCategory(categoryId)
        : await inventoryService.getSupplies();
      setSupplies(data);
    } catch (err: any) {
      setError(err.message || 'Error loading supplies');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const addSupply = async (data: CreateSupply) => {
    const newSupply = await inventoryService.createSupply(data);
    // Remove if current list relies on specific sorting or refetch based on API triggers
    setSupplies(prev => [...prev, newSupply]);
    return newSupply;
  };

  const editSupply = async (id: string, data: UpdateSupply) => {
    const updated = await inventoryService.updateSupply(id, data);
    setSupplies(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const removeSupply = async (id: string) => {
    await inventoryService.deleteSupply(id);
    setSupplies(prev => prev.filter(s => s.id !== id));
  };

  return {
    supplies,
    loading,
    error,
    refresh: fetchSupplies,
    addSupply,
    editSupply,
    removeSupply
  };
}
