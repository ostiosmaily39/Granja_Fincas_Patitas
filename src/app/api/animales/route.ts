import { apiSuccess, apiError, getAuthUser, parseBody } from '@/lib/api-helpers';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';

export async function GET(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const repo = new SupabaseAnimalRepository(supabase);

    const url = new URL(request.url);
    const hasQuery = [...url.searchParams.keys()].length > 0;

    if (hasQuery) {
      const params = {
        page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined,
        limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined,
        sort: url.searchParams.get('sort') ?? undefined,
        order: (url.searchParams.get('order') as 'asc' | 'desc') ?? undefined,
        species: url.searchParams.get('species') ?? undefined,
        healthStatus: url.searchParams.get('healthStatus') ?? undefined,
        vaccinationStatus: url.searchParams.get('vaccinationStatus') ?? undefined,
        sex: url.searchParams.get('sex') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        search: url.searchParams.get('search') ?? undefined,
      };

      const result = await repo.search(params);
      return apiSuccess(result);
    }

    const animals = await repo.getAll();
    return apiSuccess(animals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const body = await parseBody(request);
    const repo = new SupabaseAnimalRepository(supabase);

    const created = await repo.create(body);
    return apiSuccess(created, undefined, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 400;
    return apiError(message, status);
  }
}