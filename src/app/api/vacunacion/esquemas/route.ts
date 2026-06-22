import { apiSuccess, apiError, getAuthUser, parseBody } from '@/lib/api-helpers';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import { CreateVaccineSchemeInputSchema } from '@/types/domain/health.schema';

export async function GET(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const speciesId = new URL(request.url).searchParams.get('speciesId') ?? undefined;

    const repo = new SupabaseHealthRepository(supabase);
    const schemes = await repo.getVaccineSchemes(speciesId);

    return apiSuccess(schemes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const input = await parseBody(request, CreateVaccineSchemeInputSchema);

    const repo = new SupabaseHealthRepository(supabase);
    const scheme = await repo.createVaccineScheme(input);

    return apiSuccess(scheme, undefined, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 400;
    return apiError(message, status);
  }
}
