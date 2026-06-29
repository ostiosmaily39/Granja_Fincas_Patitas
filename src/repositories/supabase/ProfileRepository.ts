import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProfileSchema, type Profile } from '@/types/domain/profile.schema';
import type { IProfileRepository } from '../IProfileRepository';

export class SupabaseProfileRepository implements IProfileRepository {
  private getClient(supabaseClient?: SupabaseClient) {
    if (supabaseClient) return supabaseClient;
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getById(id: string, supabaseClient?: SupabaseClient): Promise<Profile | null> {
    const supabase = this.getClient(supabaseClient);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return ProfileSchema.parse(data);
  }

  async getAll(supabaseClient?: SupabaseClient): Promise<Profile[]> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    if (!data) return [];
    
    const result = ProfileSchema.array().safeParse(data);
    
    if (!result.success) {
      console.warn('⚠️ Se encontraron perfiles con datos inválidos:');
      
      // Mostrar detalles de cada perfil inválido
      result.error.issues.forEach((issue) => {
        const profileIndex = issue.path[0] as number; // ← Agregar 'as number'
        const profile = data[profileIndex];
        
        if (profile) {
          console.warn(`❌ Perfil #${profileIndex} - ID: ${profile.id} - Email: "${profile.email}"`);
          console.warn(`   Problema: ${issue.message}`);
        }
      });
      
      // Filtrar solo los perfiles válidos
      const validProfiles = data.filter((profile) => 
        ProfileSchema.safeParse(profile).success
      );
      
      console.log(`✅ Mostrando ${validProfiles.length} perfiles válidos de ${data.length} totales`);
      
      return validProfiles;
    }
    
    return result.data;
  }

  async deactivate(id: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async updateRole(id: string, role: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}
