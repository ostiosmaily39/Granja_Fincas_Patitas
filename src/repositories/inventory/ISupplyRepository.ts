import { Supply, CreateSupply, UpdateSupply } from '@/types/domain/inventory.schema';

export interface ISupplyRepository {
  getAll(): Promise<Supply[]>;
  getByCategory(categoryId: string): Promise<Supply[]>;
  getById(id: string): Promise<Supply | null>;
  create(data: CreateSupply): Promise<Supply>;
  update(id: string, data: UpdateSupply): Promise<Supply>;
  delete(id: string): Promise<void>;
}
