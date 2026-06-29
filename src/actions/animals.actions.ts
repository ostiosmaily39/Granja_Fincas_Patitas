'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAnimal(formData: FormData) {
  const supabase = await createClient();
  
  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const { error } = await supabase
    .from('animals')
    .insert({
      name: formData.get('name'),
      species: formData.get('species'),
      breed: formData.get('breed'),
      age: formData.get('age'),
      status: formData.get('status'),
      created_by: user.id,
      created_by_role: profile?.role || 'EMPLEADO',
      created_by_name: profile?.full_name || user.email,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/animales');
  return { success: true };
}

export async function updateAnimal(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Verificar si el registro existe y quién lo creó
  const { data: existingRecord } = await supabase
    .from('animals')
    .select('created_by, created_by_role')
    .eq('id', id)
    .single();

  // EMPLEADO solo puede editar sus propios registros
  if (profile?.role === 'EMPLEADO' && existingRecord?.created_by !== user.id) {
    return { success: false, error: 'No tienes permisos para editar este registro' };
  }

  const { error } = await supabase
    .from('animals')
    .update({
      name: formData.get('name'),
      species: formData.get('species'),
      breed: formData.get('breed'),
      age: formData.get('age'),
      status: formData.get('status'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/animales');
  return { success: true };
}

export async function deleteAnimal(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Verificar si el registro existe y quién lo creó
  const { data: existingRecord } = await supabase
    .from('animals')
    .select('created_by, created_by_role')
    .eq('id', id)
    .single();

  // EMPLEADO solo puede eliminar sus propios registros
  if (profile?.role === 'EMPLEADO' && existingRecord?.created_by !== user.id) {
    return { success: false, error: 'No tienes permisos para eliminar este registro' };
  }

  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/animales');
  return { success: true };
}