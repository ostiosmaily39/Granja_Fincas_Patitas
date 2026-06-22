import type { Profile } from '@/types/domain/profile.schema';

export interface IProfileRepository {
  /**
   * Obtiene un perfil por su UUID de base de datos
   */
  getById(id: string): Promise<Profile | null>;

  /**
   * Obtiene todos los perfiles de la granja (Para listados Admin)
   */
  getAll(): Promise<Profile[]>;
  
  /**
   * Desactiva un usuario (Soft Delete)
   */
  deactivate(id: string): Promise<void>;
  
  /**
   * Cambia el rol de un usuario
   */
  updateRole(id: string, rol: string): Promise<void>;
}
