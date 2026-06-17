import { z } from 'zod';

// --- Especies (Species) ---
export const SpeciesSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  display_name: z.string(),
  gestation_days: z.number().int().nullable(),
  code_prefix: z.string(),
  is_productive_milk: z.boolean().default(false),
  is_productive_eggs: z.boolean().default(false),
  description: z.string().nullable().optional()
});

export type Species = z.infer<typeof SpeciesSchema>;

// --- Razas (Breeds) ---
export const BreedSchema = z.object({
  id: z.string().uuid(),
  species_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional()
});

export type Breed = z.infer<typeof BreedSchema>;

// --- Animales (Animals) ---
export const AnimalStatusEnum = z.enum(['activo', 'descartado', 'vendido', 'muerto']);
export const SexEnum = z.enum(['macho', 'hembra']);
/** UI + valores devueltos por Postgres (GRANJA_DB) */
export const HealthStatusEnum = z.enum([
  'sano',
  'enfermo',
  'en_tratamiento',
  'cuarentena',
  'cronico',
  'fallecido',
]);
export const ReproductiveStatusEnum = z.enum([
  'no_aplica',
  'apto',
  'gestante',
  'lactante',
  'descanso',
  'sin_gestion_activa',
  'en_gestion',
  'en_parto',
]);
export const VaccinationStatusEnum = z.enum(['al_dia', 'pendiente', 'vencido']);
export const AnimalOriginEnum = z.enum(['nacido_en_finca', 'adquirido_externo']);

export const AnimalSchema = z.object({
  id: z.string().uuid(),
  code: z.string(), // Ej. VAC-001
  name: z.string().nullable().optional(),
  species_id: z.string().uuid(),
  breed_id: z.string().uuid().nullable().optional(),
  
  sex: SexEnum,
  birth_date: z.string().nullable().optional(),
  acquisition_date: z.string().nullable().optional(),
  origin: AnimalOriginEnum.nullable().optional(),
  
  initial_weight_kg: z.number().nullable().optional(),
  current_weight_kg: z.number().nullable().optional(),
  
  // Genealogía (Aprobado: Opcional o llenado manual por el usuario)
  mother_id: z.string().uuid().nullable().optional(),
  father_id: z.string().uuid().nullable().optional(),
  father_external: z.string().nullable().optional(), // Por si el padre es comprado/de pajilla
  
  // Estados Dinámicos
  status: AnimalStatusEnum.default('activo'),
  health_status: HealthStatusEnum.default('sano'),
  vaccination_status: VaccinationStatusEnum.default('pendiente'),
  reproductive_status: ReproductiveStatusEnum.default('no_aplica'),
  
  // Egresos y Metadata
  egress_date: z.string().nullable().optional(),
  egress_reason: z.string().nullable().optional(),
  egress_notes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  
  registered_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type Animal = z.infer<typeof AnimalSchema>;

// --- DTO para mostrar en tabla con Relaciones (Join) ---
export type AnimalWithRelations = Animal & {
  species?: Species | null;
  breed?: Breed | null;
  mother?: { code: string; name?: string } | null;
};

// --- DTO para creación ---
export const CreateAnimalSchema = AnimalSchema.omit({
  id: true,
  code: true, // Se autogenera basado en el prefix
  created_at: true,
  updated_at: true
}).extend({
  // Puede requerir validaciones extras antes de guardar
});

export type CreateAnimalDTO = z.infer<typeof CreateAnimalSchema>;
