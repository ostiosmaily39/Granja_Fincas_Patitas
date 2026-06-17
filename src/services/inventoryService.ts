import { SupplyCategoryRepository } from '@/repositories/supabase/inventory/SupplyCategoryRepository';
import { SupplyRepository } from '@/repositories/supabase/inventory/SupplyRepository';
import { ISupplyCategoryRepository } from '@/repositories/inventory/ISupplyCategoryRepository';
import { ISupplyRepository } from '@/repositories/inventory/ISupplyRepository';
import { 
  CreateSupplyCategory, UpdateSupplyCategory, 
  CreateSupply, UpdateSupply 
} from '@/types/domain/inventory.schema';

const categoryRepo: ISupplyCategoryRepository = new SupplyCategoryRepository();
const supplyRepo: ISupplyRepository = new SupplyRepository();

export const inventoryService = {
  // Categories
  getCategories: () => categoryRepo.getAll(),
  getCategory: (id: string) => categoryRepo.getById(id),
  createCategory: (data: CreateSupplyCategory) => categoryRepo.create(data),
  updateCategory: (id: string, data: UpdateSupplyCategory) => categoryRepo.update(id, data),
  deleteCategory: (id: string) => categoryRepo.delete(id),

  // Supplies
  getSupplies: () => supplyRepo.getAll(),
  getSuppliesByCategory: (categoryId: string) => supplyRepo.getByCategory(categoryId),
  getSupply: (id: string) => supplyRepo.getById(id),
  createSupply: (data: CreateSupply) => supplyRepo.create(data),
  updateSupply: (id: string, data: UpdateSupply) => supplyRepo.update(id, data),
  deleteSupply: (id: string) => supplyRepo.delete(id),
};
