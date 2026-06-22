import type { Rol } from '@/types/domain/user.schema';

const ROLE_ALIASES: Record<string, Rol> = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  ENCARGADO: 'ENCARGADO',
  EMPLEADO: 'EMPLEADO',
};

/** Normaliza roles desde BD (ADMINISTRADOR, administrador, etc.) */
export function normalizeRole(role: string | null | undefined): Rol | null {
  if (!role) return null;
  const key = role.toUpperCase().trim();
  return ROLE_ALIASES[key] ?? null;
}

export function isAdministrator(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'ADMINISTRADOR';
}

export function hasAnyRole(
  userRole: string | null | undefined,
  allowedRoles: Rol[]
): boolean {
  const normalized = normalizeRole(userRole);
  if (!normalized) return false;
  if (normalized === 'ADMINISTRADOR') return true;
  return allowedRoles.some((r) => r === normalized);
}
