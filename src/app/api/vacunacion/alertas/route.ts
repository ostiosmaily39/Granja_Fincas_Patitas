import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';

export async function GET() {
  try {
    const { supabase } = await getAuthUser();
    const repo = new SupabaseHealthRepository(supabase);
    const alerts = await repo.getVaccinationAlerts();

    return apiSuccess(alerts, { count: alerts.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}
