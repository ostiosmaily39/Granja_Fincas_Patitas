import { z } from 'zod';

/**
 * Roles permitidos en el sistema.
 * ADMINISTRADOR: Acceso total.
 * ENCARGADO: Gestión operativa de la granja.
 * EMPLEADO: Registro de actividades básicas.
 */
export const ROL_OPTIONS = ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'] as const;

export const RolEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
  z.enum(ROL_OPTIONS)
);
export type Rol = z.infer<typeof RolEnum>;

/**
 * Esquema para el perfil de usuario (Tabla public.profiles)
 * Adaptado a la estructura oficial requerida por el usuario.
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  email: z.string().email(),
  role: RolEnum.default('EMPLEADO'),
  is_active: z.boolean().default(true),
  phone: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  last_login_at: z.string().nullable().optional(),
  login_count: z.number().default(0),
  failed_attempts: z.number().default(0),
  locked_until: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  create_by: z.string().uuid().nullable().optional(),
});

export type UserProfile = z.infer<typeof UserSchema>;

/**
 * Esquemas para validación de formularios de Auth
 */
export const LoginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
export type LoginCredentials = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
export type RegisterUser = z.infer<typeof RegisterSchema>;
