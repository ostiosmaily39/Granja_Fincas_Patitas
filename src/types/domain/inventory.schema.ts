import { z } from 'zod';

export const SupplyCategoryEnum = z.enum(['alimento', 'medicamento', 'otro']);

export const SupplyCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: SupplyCategoryEnum,
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional()
});

export const CreateSupplyCategorySchema = SupplyCategorySchema.omit({
  id: true,
  created_at: true
});

export const UpdateSupplyCategorySchema = CreateSupplyCategorySchema.partial();

export const SupplySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category_id: z.string().uuid(),
  unit: z.string().min(1, "Debe especificar la unidad de medida (ej. kg, litros)"),
  current_stock: z.number().min(0, "El stock no puede ser negativo").default(0),
  min_stock: z.number().min(0, "El stock mínimo no puede ser negativo").default(0),
  unit_price: z.number().min(0, "El precio unitario no puede ser negativo").nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  batch_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  registered_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateSupplySchema = SupplySchema.omit({
  id: true,
  code: true,
  current_stock: true,
  created_at: true,
  updated_at: true
}).extend({
  initial_stock: z.number().min(0).default(0).optional()
});

export const UpdateSupplySchema = SupplySchema.omit({
  id: true,
  code: true,
  current_stock: true,
  created_at: true,
  updated_at: true,
  registered_by: true
}).partial();

export type SupplyCategory = z.infer<typeof SupplyCategorySchema>;
export type CreateSupplyCategory = z.infer<typeof CreateSupplyCategorySchema>;
export type UpdateSupplyCategory = z.infer<typeof UpdateSupplyCategorySchema>;

export type Supply = z.infer<typeof SupplySchema>;
export type CreateSupply = z.infer<typeof CreateSupplySchema>;
export type UpdateSupply = z.infer<typeof UpdateSupplySchema>;