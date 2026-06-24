'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole } from '@/lib/role-utils';

type DashboardUser = {
  id: string;
  email: string;
  full_name?: string;
  role: string;
};

/** Sincroniza el rol del perfil obtenido en el servidor con AuthContext (cliente). */
export default function DashboardAuthSync({ user }: { user: DashboardUser }) {
  const { hydrateUser } = useAuth();

  useEffect(() => {
    hydrateUser({
      id: user.id,
      email: user.email,
      full_name: user.full_name ?? null,
      role: normalizeRole(user.role) ?? 'EMPLEADO',
    });
  }, [user, hydrateUser]);

  return null;
}
