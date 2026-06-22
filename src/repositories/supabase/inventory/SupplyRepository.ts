import { createClient } from '@/utils/supabase/client';
import { ISupplyRepository } from '../../inventory/ISupplyRepository';
import { 
  Supply, 
  CreateSupply, 
  UpdateSupply, 
  SupplySchema 
} from '@/types/domain/inventory.schema';

export class SupplyRepository implements ISupplyRepository {
  private get supabase() {
    return createClient();
  }

  async getAll(): Promise<Supply[]> {
    const { data, error } = await this.supabase
      .from('supplies')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    return SupplySchema.array().parse(data);
  }

  async getByCategory(categoryId: string): Promise<Supply[]> {
    const { data, error } = await this.supabase
      .from('supplies')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    
    if (error) throw new Error(error.message);
    return SupplySchema.array().parse(data);
  }

  async getById(id: string): Promise<Supply | null> {
    const { data, error } = await this.supabase
      .from('supplies')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return SupplySchema.parse(data);
  }

  async create(input: CreateSupply): Promise<Supply> {
    // The DB has fields like current_stock defaults to 0, which we omit here. 
    // Any extra keys like initial_stock are removed before sending to Supabase if not in table.
    const payload = { ...input };
    if ('initial_stock' in payload) {
      delete (payload as any).initial_stock;
    }

    const { data, error } = await this.supabase
      .from('supplies')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return SupplySchema.parse(data);
  }

  async update(id: string, input: UpdateSupply): Promise<Supply> {
    const { data, error } = await this.supabase
      .from('supplies')
      .update(input)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return SupplySchema.parse(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('supplies')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
}
