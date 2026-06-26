import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseInventoryRepository } from '@/repositories/supabase/InventoryRepository';

export async function GET() {
  try {
    const { supabase } = await getAuthUser();
    const repo = new SupabaseInventoryRepository(supabase);
    const supplies = await repo.listSupplies();

    const available = supplies
      .filter((s) => s.current_stock > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        current_stock: s.current_stock,
      }));

    return apiSuccess(available);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}
