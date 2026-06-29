import type { SupabaseClient } from '@supabase/supabase-js';
import type { IReproductionRepository } from '../IReproductionRepository';
import type {
  ReproductiveEvent,
  ReproductiveEventWithRelations,
  ReproductiveAnimalMini,
  CreateReproductiveEventDTO,
  UpdateGestationStatusDTO,
} from '@/types/domain/reproduction.schema';
import { REPRO_COLS } from '@/lib/repro-columns';

// ─── Helper: une filas con mapa de animales ───────────────────────────────────

function attachAnimals(
  rows: ReproductiveEvent[],
  byId: Map<string, ReproductiveAnimalMini>
): ReproductiveEventWithRelations[] {
  return rows.map((row) => ({
    ...row,
    female_animal: row.animal_id ? (byId.get(row.animal_id) ?? null) : null,
    male_animal: row.father_id ? (byId.get(row.father_id) ?? null) : null,
  }));
}

// ─── Helper: convierte fila cruda de PostgREST al tipo interno ────────────────

function rowToEvent(r: Record<string, unknown>): ReproductiveEvent {
  return {
    id: String(r.id),
    animal_id: String(r[REPRO_COLS.female]),
    father_id: r[REPRO_COLS.father] ? String(r[REPRO_COLS.father]) : null,
    father_external: (r[REPRO_COLS.fatherExt] as string | null) ?? null,
    event_type: r[REPRO_COLS.eventType] as any,
    event_date: String(r.event_date),
    gestation_status: (r[REPRO_COLS.status] as any) ?? undefined,
    estimated_delivery_date: r[REPRO_COLS.estimated] ? String(r[REPRO_COLS.estimated]) : null,
    estimated_delivery_date_to: r.estimated_delivery_date_to ? String(r.estimated_delivery_date_to) : null,
    responsible: r[REPRO_COLS.responsible] ? String(r[REPRO_COLS.responsible]) : undefined,
    registered_by: r[REPRO_COLS.registeredBy] ? String(r[REPRO_COLS.registeredBy]) : undefined,
    notes: (r.notes as string | null) ?? null,
    // Campos de auditoría (pueden no estar presentes en todas las consultas)
    created_by: r.created_by ? String(r.created_by) : undefined,
    created_by_name: r.created_by_name ? String(r.created_by_name) : undefined,
    created_by_role: r.created_by_role ? String(r.created_by_role) : undefined,
    created_at: r.created_at as string | undefined,
    updated_at: r.updated_at as string | undefined,
  };
}

// ─── Helper: obtiene UUID del usuario autenticado ─────────────────────────────

async function requireAuth(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error('Debes iniciar sesión para registrar eventos reproductivos.');
  }
  return data.user.id;
}

// ─── Helper: carga animales por IDs y devuelve mapa id → mini ────────────────

async function loadAnimalsMap(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, ReproductiveAnimalMini>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from('animals')
    .select('id, code, name, species_id, breed:breed_id(name)')
    .in('id', ids);

  if (error) throw new Error(`Error al cargar animales: ${error.message}`);

  const map = new Map<string, ReproductiveAnimalMini>();
  for (const a of data ?? []) {
    map.set(a.id, {
      id: a.id,
      code: a.code,
      name: a.name,
      species_id: a.species_id,
      breed: Array.isArray(a.breed) ? a.breed[0] : a.breed ?? null,
    });
  }
  return map;
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

export class SupabaseReproductionRepository implements IReproductionRepository {
  constructor(private supabase: SupabaseClient) { }

  async list(): Promise<ReproductiveEventWithRelations[]> {
    const { data, error } = await this.supabase
      .from('reproductive_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw new Error(`Error al cargar reproducción: ${error.message}`);

    const rows = (data ?? []).map(rowToEvent);

    const ids = new Set<string>();
    for (const e of rows) {
      if (e.animal_id) ids.add(e.animal_id);
      if (e.father_id) ids.add(e.father_id);
    }

    const byId = await loadAnimalsMap(this.supabase, [...ids]);
    return attachAnimals(rows, byId);
  }

  async listByAnimal(animalId: string): Promise<ReproductiveEventWithRelations[]> {
    const { data, error } = await this.supabase
      .from('reproductive_events')
      .select('*')
      .or(`${REPRO_COLS.female}.eq.${animalId},${REPRO_COLS.father}.eq.${animalId}`)
      .order('event_date', { ascending: false });

    if (error) throw new Error(`Error al cargar historial: ${error.message}`);

    const rows = (data ?? []).map(rowToEvent);

    const ids = new Set<string>();
    for (const e of rows) {
      if (e.animal_id) ids.add(e.animal_id);
      if (e.father_id) ids.add(e.father_id);
    }

    const byId = await loadAnimalsMap(this.supabase, [...ids]);
    return attachAnimals(rows, byId);
  }

  async create(input: CreateReproductiveEventDTO): Promise<ReproductiveEvent> {
    const registered_by = await requireAuth(this.supabase);

    // Verificar gestación activa existente
    const { data: active } = await this.supabase
      .from('reproductive_events')
      .select('id')
      .eq(REPRO_COLS.female, input.animal_id)
      .in(REPRO_COLS.status, ['en_seguimiento', 'confirmada'])
      .maybeSingle();

    if (active) {
      throw new Error(
        'Esta hembra ya tiene una gestación activa. Actualice ese evento antes de crear uno nuevo.'
      );
    }

    // Obtener perfil del usuario para auditoría
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', registered_by)
      .single();

    const { data, error } = await this.supabase
      .from('reproductive_events')
      .insert({
        [REPRO_COLS.female]: input.animal_id,
        [REPRO_COLS.father]: input.father_id ?? null,
        [REPRO_COLS.fatherExt]: input.father_external?.trim() || null,
        [REPRO_COLS.eventType]: input.event_type,
        event_date: input.event_date,
        [REPRO_COLS.status]: 'en_seguimiento',
        [REPRO_COLS.responsible]: input.responsible.trim(),
        [REPRO_COLS.registeredBy]: registered_by,
        notes: input.notes?.trim() || null,
        // Campos de auditoría
        created_by: registered_by,
        created_by_role: profile?.role || 'EMPLEADO',
        created_by_name: profile?.full_name || 'Usuario',
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error al crear el evento: ${error.message}`);

    await Promise.all([
      this.supabase
        .from('animals')
        .update({ reproductive_status: 'en_gestion' })
        .eq('id', input.animal_id),

      this.supabase.from('animal_events').insert({
        animal_id: input.animal_id,
        event_type: 'reproductivo',
        event_date: new Date().toISOString(),
        title: `Inicio de ${input.event_type === 'monta_natural' ? 'monta natural' : 'inseminación artificial'}`,
        description: `Responsable: ${input.responsible}. Padre: ${input.father_id ?? input.father_external ?? 'No especificado'}.`,
        reference_id: data.id,
        reference_table: 'reproductive_events',
        performed_by: registered_by,
      }),
    ]);

    return rowToEvent(data as Record<string, unknown>);
  }

  async update(id: string, input: UpdateGestationStatusDTO): Promise<ReproductiveEvent> {
    const registered_by = await requireAuth(this.supabase);

    const patch: Record<string, unknown> = {
      [REPRO_COLS.status]: input.gestation_status,
      updated_at: new Date().toISOString(),
      failure_reason: input.gestation_status === 'fallida'
        ? (input.failure_reason?.trim() || null)
        : null,
    };

    if (input.estimated_delivery_date !== undefined) {
      patch[REPRO_COLS.estimated] = input.estimated_delivery_date?.trim() || null;
    }
    if (input.estimated_delivery_date_to !== undefined) {
      patch['estimated_delivery_date_to'] = input.estimated_delivery_date_to?.trim() || null;
    }
    if (input.notes !== undefined) {
      patch['notes'] = input.notes?.trim() || null;
    }

    const { data, error } = await this.supabase
      .from('reproductive_events')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Error al actualizar el evento: ${error.message}`);

    const femaleId = data[REPRO_COLS.female] as string;

    if (input.gestation_status === 'fallida' || input.gestation_status === 'parto_exitoso') {
      await Promise.all([
        this.supabase
          .from('animals')
          .update({ reproductive_status: 'sin_gestion_activa' })
          .eq('id', femaleId),

        this.supabase.from('animal_events').insert({
          animal_id: femaleId,
          event_type: 'reproductivo',
          event_date: new Date().toISOString(),
          title: input.gestation_status === 'parto_exitoso' ? 'Parto exitoso' : 'Gestación fallida',
          description: input.failure_reason || 'Sin motivo especificado',
          reference_id: id,
          reference_table: 'reproductive_events',
          performed_by: registered_by,
        }),
      ]);
    }

    return rowToEvent(data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reproductive_events')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar el evento: ${error.message}`);
  }

  async listAnimalsBySex(sex: 'hembra' | 'macho'): Promise<ReproductiveAnimalMini[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select('id, code, name, species_id, breed:breed_id(name)')
      .eq('sex', sex)
      .eq('status', 'activo')
      .order('code');

    if (error) throw new Error(`Error al cargar animales: ${error.message}`);

    return (data ?? []).map((a: any) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      species_id: a.species_id,
      breed: Array.isArray(a.breed) ? a.breed[0] : a.breed ?? null,
    }));
  }

  async getReproductionSummary(): Promise<{
    successfulBirths: number;
    activeGestations: number;
    failures: number;
  }> {
    const [
      { count: births, error: e1 },
      { count: gestations, error: e2 },
      { count: failures, error: e3 },
    ] = await Promise.all([
      this.supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq(REPRO_COLS.status, 'parto_exitoso'),
      this.supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('reproductive_status', 'en_gestion')
        .eq('status', 'activo')
        .eq('sex', 'hembra'),
      this.supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq(REPRO_COLS.status, 'fallida'),
    ]);

    if (e1 || e2 || e3) {
      console.warn('[reproducción] error en resumen:', e1?.message, e2?.message, e3?.message);
    }

    return {
      successfulBirths: births ?? 0,
      activeGestations: gestations ?? 0,
      failures: failures ?? 0,
    };
  }
}
