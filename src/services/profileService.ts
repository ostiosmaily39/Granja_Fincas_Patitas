import { SupabaseProfileRepository } from '@/repositories/supabase/ProfileRepository';
import { IProfileRepository } from '@/repositories/IProfileRepository';
import { UserProfile, Rol } from '@/types/domain/user.schema';

// const supabase = createClient();
const profileRepo: IProfileRepository = new SupabaseProfileRepository();

export const profileService = {
  /**
   * Obtiene la lista completa de perfiles (Solo para administradores)
   */
  async listarPerfiles(): Promise<UserProfile[]> {
    return (await profileRepo.getAll()) as unknown as UserProfile[];
  },

  /**
   * Cambia el rol de un usuario
   */
  async actualizarRol(userId: string, nuevoRol: Rol): Promise<void> {
    return profileRepo.updateRole(userId, nuevoRol);
  },

  /**
   * Obtiene el perfil por ID
   */
  async obtenerPorId(id: string): Promise<UserProfile | null> {
    return (await profileRepo.getById(id)) as unknown as UserProfile | null;
  }
};
