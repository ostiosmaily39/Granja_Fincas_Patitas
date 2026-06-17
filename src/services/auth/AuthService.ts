import { createClient } from '@/utils/supabase/client';
import { SupabaseAuthRepository } from '@/repositories/supabase/AuthRepository';
import { IAuthRepository } from '@/repositories/IAuthRepository';
import { LoginCredentials, RegisterUser, UserProfile } from '@/types/domain/user.schema';

// Instanciamos el repositorio con el cliente de Supabase (browser por defecto para el servicio base)
const supabase = createClient();
const authRepo: IAuthRepository = new SupabaseAuthRepository(supabase);

export const authService = {
  /**
   * Intenta iniciar sesión y retorna el perfil completo con rol
   */
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    return authRepo.login(credentials);
  },

  /**
   * Registra un nuevo perfil de usuario/empleado
   */
  async register(data: RegisterUser): Promise<UserProfile> {
    return authRepo.register(data);
  },

  /**
   * Cierra la sesión activa
   */
  async logout(): Promise<void> {
    return authRepo.logout();
  },

  /**
   * Obtiene el perfil del usuario actual si existe sesión
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    return authRepo.getCurrentUser();
  }
};
