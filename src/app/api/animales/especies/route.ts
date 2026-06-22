import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';

export async function GET() {
  try {
    const { supabase } = await getAuthUser();
    const repo = new SupabaseAnimalRepository(supabase);
    const species = await repo.getSpecies();

    return apiSuccess(species);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}
