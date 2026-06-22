import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';

export async function GET(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const speciesId = new URL(request.url).searchParams.get('speciesId');

    if (!speciesId) {
      return apiError('El parámetro speciesId es requerido', 400);
    }

    const repo = new SupabaseAnimalRepository(supabase);
    const breeds = await repo.getBreedsBySpecies(speciesId);

    return apiSuccess(breeds);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}
