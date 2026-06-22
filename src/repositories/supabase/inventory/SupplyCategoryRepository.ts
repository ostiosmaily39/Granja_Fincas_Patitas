import { createClient } from '@/utils/supabase/client';
import { ISupplyCategoryRepository } from '../../inventory/ISupplyCategoryRepository';
import { 
  SupplyCategory, 
  CreateSupplyCategory, 
  UpdateSupplyCategory, 
  SupplyCategorySchema 
} from '@/types/domain/inventory.schema';

export class SupplyCategoryRepository implements ISupplyCategoryRepository {
  private get supabase() {
    return createClient();
  }

  async getAll(): Promise<SupplyCategory[]> {
    const { data, error } = await this.supabase
      .from('supply_categories')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    return SupplyCategorySchema.array().parse(data);
  }

  async getById(id: string): Promise<SupplyCategory | null> {
    const { data, error } = await this.supabase
      .from('supply_categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return SupplyCategorySchema.parse(data);
  }

  async create(input: CreateSupplyCategory): Promise<SupplyCategory> {
    const { data, error } = await this.supabase
      .from('supply_categories')
      .insert(input)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return SupplyCategorySchema.parse(data);
  }

  async update(id: string, input: UpdateSupplyCategory): Promise<SupplyCategory> {
    const { data, error } = await this.supabase
      .from('supply_categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return SupplyCategorySchema.parse(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('supply_categories')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
}
