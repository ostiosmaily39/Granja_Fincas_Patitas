import { z } from 'zod';
import { RolEnum } from './user.schema';

/**
 * Esquema compatible con la tabla public.profiles
 */
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  email: z.string().email(),
  role: RolEnum.default('EMPLEADO'),
  is_active: z.boolean().default(true),
  phone: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  login_count: z.number().default(0),
  failed_attempts: z.number().default(0),
  create_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
