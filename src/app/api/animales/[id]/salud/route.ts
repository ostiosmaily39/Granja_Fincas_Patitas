import { apiSuccess, apiError, getAuthUser, parseBody } from '@/lib/api-helpers';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import { CreateHealthEventInputSchema } from '@/types/domain/health.schema';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await getAuthUser();
    const { id: animalId } = await params;
    const input = await parseBody(request, CreateHealthEventInputSchema);

    if (input.animal_id !== animalId) {
      return apiError('El animal_id no coincide con la ruta', 400);
    }

    const repo = new SupabaseHealthRepository(supabase);
    const event = await repo.addHealthEvent(input);

    return apiSuccess(event, { registeredAt: new Date().toISOString() }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 400;
    return apiError(message, status);
  }
}
