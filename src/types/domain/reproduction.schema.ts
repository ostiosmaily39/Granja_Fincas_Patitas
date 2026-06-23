import { z } from 'zod';

// ─── Enums alineados 100% con BD ─────────────────────────────────────────────

export const EventTypeEnum = z.enum([
  'monta_natural',
  'inseminacion_artificial',
]);
export type EventType = z.infer<typeof EventTypeEnum>;

export const GestationStatusEnum = z.enum([
  'en_seguimiento',
  'confirmada',
  'fallida',
  'parto_exitoso',
]);
export type GestationStatus = z.infer<typeof GestationStatusEnum>;

// ─── Tipo mínimo de animal para selects ──────────────────────────────────────

export type ReproductiveAnimalMini = {
  id: string;
  code: string;
  name?: string | null;
  species_id?: string;
  breed?: { name: string } | null;
};

/** Formatea el animal como "CER-2026-00002 · Lola" */
export function labelAnimal(a: ReproductiveAnimalMini): string {
  const nick = a.name?.trim();
  return nick ? `${a.code} · ${nick}` : a.code;
}

// ─── Entidad principal (columnas reales de BD) ────────────────────────────────

export const ReproductiveEventSchema = z.object({
  id: z.string().uuid(),
  animal_id: z.string().uuid(),
  father_id: z.string().uuid().nullable().optional(),
  father_external: z.string().nullable().optional(),
  event_type: EventTypeEnum,
  event_date: z.string(),
  gestation_status: GestationStatusEnum.optional(),
  estimated_delivery_date: z.string().nullable().optional(),
  responsible: z.string().optional(),
  registered_by: z.string().uuid().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ReproductiveEvent = z.infer<typeof ReproductiveEventSchema>;

// ─── Con relaciones (para la vista de lista) ──────────────────────────────────

export type ReproductiveEventWithRelations = ReproductiveEvent & {
  female_animal?: ReproductiveAnimalMini | null;
  male_animal?: ReproductiveAnimalMini | null;
};

// ─── DTO de creación ──────────────────────────────────────────────────────────

export const CreateReproductiveEventSchema = z
  .object({
    animal_id: z.string().uuid('Selecciona una hembra válida'),
    event_type: EventTypeEnum,
    event_date: z.string().min(1, 'Indica la fecha del evento'),
    father_id: z.string().uuid().nullable().optional(),
    father_external: z.string().nullable().optional(),
    responsible: z.string().min(2, 'Indica el responsable'),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (d) => !(d.father_id && d.father_external?.trim()),
    { message: 'Indica solo macho registrado o padre externo, no ambos.' }
  );

export type CreateReproductiveEventDTO = z.infer<typeof CreateReproductiveEventSchema>;

// ─── DTO de actualización de estado ──────────────────────────────────────────

export const UpdateGestationStatusSchema = z.object({
  gestation_status: GestationStatusEnum,
  failure_reason: z.string().nullable().optional(),
  estimated_delivery_date: z.string().nullable().optional(),
});

export type UpdateGestationStatusDTO = z.infer<typeof UpdateGestationStatusSchema>;