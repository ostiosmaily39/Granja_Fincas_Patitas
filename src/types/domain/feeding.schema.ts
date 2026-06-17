import { z } from 'zod';

/** Fila de feeding_records + join opcional a insumo */
export const FeedingRecordSchema = z.object({
  id: z.string().uuid(),
  animal_id: z.string().uuid(),
  supply_id: z.string().uuid(),
  quantity: z.number(),
  unit: z.string(),
  fed_at: z.string(),
  notes: z.string().nullable().optional(),
  registered_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  supply: z
    .object({
      name: z.string(),
      unit: z.string(),
    })
    .optional(),
});

export type FeedingRecord = z.infer<typeof FeedingRecordSchema>;

/** Alta desde la app: unidad y usuario los resuelve el repositorio */
export const CreateFeedingDTOSchema = z.object({
  animal_id: z.string().uuid(),
  supply_id: z.string().uuid(),
  quantity: z.number().min(0.01, 'La cantidad mínima es 0,01'),
  notes: z.string().nullable().optional(),
  /** ISO 8601; si no se envía, usa la hora del servidor en el RPC */
  fed_at: z.string().optional(),
});

export type CreateFeedingDTO = z.infer<typeof CreateFeedingDTOSchema>;
