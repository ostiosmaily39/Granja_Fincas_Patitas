import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import type { AnimalEventType } from '@/types/domain/health.schema';

const CATEGORY_EVENT_TYPES: Record<string, AnimalEventType[]> = {
  salud: ['salud'],
  vacunacion: ['vacunacion'],
  alimentacion: ['alimentacion'],
  otros: [
    'ingreso',
    'actualizacion',
    'reproductivo',
    'parto',
    'produccion',
    'egreso',
    'correccion',
  ],
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await getAuthUser();
    const { id: animalId } = await params;
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const fromDate = searchParams.get('from') ?? undefined;
    const toDate = searchParams.get('to') ?? undefined;
    const search = searchParams.get('q') ?? undefined;
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 200);
    const offset = Number(searchParams.get('offset') ?? 0);

    const eventTypes =
      category && category !== 'all' ? CATEGORY_EVENT_TYPES[category] : undefined;

    if (category && category !== 'all' && !eventTypes) {
      return apiError('Categoría de evento no válida', 400);
    }

    const repo = new SupabaseHealthRepository(supabase);
    const events = await repo.getTimelineByAnimal(animalId, {
      eventTypes,
      fromDate,
      toDate,
      search,
      limit,
      offset,
    });

    return apiSuccess(events, { count: events.length, limit, offset });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}
