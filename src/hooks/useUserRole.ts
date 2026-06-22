import { useAuth } from '@/contexts/AuthContext';
import { Rol } from '@/types/domain/user.schema';

/**
 * Hook personalizado para obtener el rol del usuario autenticado
 * de forma reactiva desde el AuthContext.
 */
export function useUserRole(): Rol | null {
  const { role } = useAuth();
  return role;
}
