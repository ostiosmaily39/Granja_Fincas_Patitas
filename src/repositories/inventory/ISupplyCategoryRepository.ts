import { SupplyCategory, CreateSupplyCategory, UpdateSupplyCategory } from '@/types/domain/inventory.schema';

export interface ISupplyCategoryRepository {
  getAll(): Promise<SupplyCategory[]>;
  getById(id: string): Promise<SupplyCategory | null>;
  create(data: CreateSupplyCategory): Promise<SupplyCategory>;
  update(id: string, data: UpdateSupplyCategory): Promise<SupplyCategory>;
  delete(id: string): Promise<void>;
}
