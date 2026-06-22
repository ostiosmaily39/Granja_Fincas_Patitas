import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthRepository } from '../IAuthRepository';
import { UserProfile, UserSchema, LoginSchema, RegisterSchema, LoginCredentials } from '@/types/domain/user.schema';

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) return null;

    // Obtener el perfil extendido de la tabla 'profiles'
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Si no hay perfil aún, devolvemos un objeto básico compatible con el esquema
      return UserSchema.parse({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.nombre || 'Usuario',
        role: 'EMPLEADO',
        is_active: true
      });
    }

    return UserSchema.parse(profile);
  }

  async login(credentials: LoginCredentials): Promise<UserProfile> {
    const { email, password } = LoginSchema.parse(credentials);
    
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const profile = await this.getCurrentUser();
    if (!profile) throw new Error('No se pudo recuperar el perfil del usuario');

    return profile;
  }

  async register(data: Record<string, string>): Promise<UserProfile> {
    const { email, password, full_name } = RegisterSchema.parse(data);

    const { data: authData, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Error al crear el usuario');

    // El perfil se crea automáticamente vía Database Trigger
    return UserSchema.parse({
      id: authData.user.id,
      email,
      full_name,
      role: 'EMPLEADO',
      is_active: true
    });
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}
