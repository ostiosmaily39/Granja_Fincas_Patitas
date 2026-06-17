import { IFeedingRepository } from '../IFeedingRepository';
import { FeedingRecord, CreateFeedingDTO } from '@/types/domain/feeding.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseFeedingRepository implements IFeedingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByAnimal(animalId: string): Promise<FeedingRecord[]> {
    const { data, error } = await this.supabase
      .from('feeding_records')
      .select(
        `
        id,
        animal_id,
        supply_id,
        quantity,
        unit,
        fed_at,
        notes,
        registered_by,
        created_at,
        supply:supply_id (name, unit)
      `
      )
      .eq('animal_id', animalId)
      .order('fed_at', { ascending: false });

    if (error) throw new Error(`Error al obtener historial de alimentación: ${error.message}`);
    return (data ?? []) as unknown as FeedingRecord[];
  }

  /**
   * RF014: registra consumo por animal y descuenta stock vía fn_register_feeding (CU-012).
   * Parámetros RPC alineados con GRANJA_DB_COMPLETO_CORREGIDO.sql
   */
  async addFeeding(data: CreateFeedingDTO): Promise<string> {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Debes iniciar sesión para registrar alimentación.');
    }

    const { data: supply, error: supplyError } = await this.supabase
      .from('supplies')
      .select('unit, current_stock')
      .eq('id', data.supply_id)
      .single();

    if (supplyError || !supply) {
      throw new Error('Insumo no encontrado.');
    }

    if (Number(supply.current_stock) < data.quantity) {
      throw new Error(
        `Stock insuficiente. Disponible: ${supply.current_stock} ${supply.unit}.`
      );
    }

    const fedAt = data.fed_at?.trim() || new Date().toISOString();

    const { data: feedingId, error } = await this.supabase.rpc('fn_register_feeding', {
      p_animal_id: data.animal_id,
      p_supply_id: data.supply_id,
      p_quantity: data.quantity,
      p_unit: supply.unit || 'kg',
      p_fed_at: fedAt,
      p_notes: data.notes?.trim() || null,
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(`Error al registrar alimentación: ${error.message}`);
    }

    return typeof feedingId === 'string' ? feedingId : String(feedingId ?? '');
  }

  async getFeedingSummaryByAnimal(_animalId: string): Promise<unknown> {
    return null;
  }
}
