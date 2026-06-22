'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile, Rol } from '@/types/domain/user.schema';
import { authService } from '@/services/auth/AuthService';
import { useRouter } from 'next/navigation';
import { normalizeRole } from '@/lib/role-utils';

interface AuthContextType {
  user: UserProfile | null;
  role: Rol | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hydrateUser: (profile: Partial<UserProfile> & { id: string; email: string }) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  session: null,
  loading: true,
  signOut: async () => {},
  hydrateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hydrateUser = useCallback((profile: Partial<UserProfile> & { id: string; email: string }) => {
    const role = normalizeRole(profile.role as string) ?? 'EMPLEADO';
    setUser((prev) => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name ?? prev?.full_name ?? null,
      role,
      is_active: profile.is_active ?? prev?.is_active ?? true,
      phone: profile.phone ?? prev?.phone ?? null,
      avatar_url: profile.avatar_url ?? prev?.avatar_url ?? null,
      address: profile.address ?? prev?.address ?? null,
      login_count: prev?.login_count ?? 0,
      failed_attempts: prev?.failed_attempts ?? 0,
    }));
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser((prev) => ({
          ...currentUser,
          role: normalizeRole(currentUser.role) ?? prev?.role ?? 'EMPLEADO',
        }));
      }
    } catch (error) {
      console.error('Error fetching auth profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Inicializar sesión
    fetchProfile();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setSession(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      session, 
      loading, 
      signOut,
      hydrateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
