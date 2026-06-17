import type { LoginCredentials, RegisterUser, UserProfile } from '@/types/domain/user.schema';

export interface IAuthRepository {
  /**
   * Inicia sesión utilizando credenciales convencionales
   */
  login(credentials: LoginCredentials): Promise<UserProfile>;

  /**
   * Registra un nuevo empleado u administrador
   */
  register(data: RegisterUser): Promise<UserProfile>;

  /**
   * Cierra la sesión activa del usuario
   */
  logout(): Promise<void>;

  /**
   * Obtiene el perfil de base de datos del usuario actualmente autenticado.
   * Si no hay sesión, retorna null.
   */
  getCurrentUser(): Promise<UserProfile | null>;
}
