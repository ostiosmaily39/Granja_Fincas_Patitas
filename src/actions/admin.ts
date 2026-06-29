'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Obtener todos los usuarios del sistema
 */
export async function getAllUsers() {
  const supabase = await createClient();
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: profiles || [] };
}

/**
 * Cambiar el rol de un usuario
 */
export async function changeUserRole(userId: string, newRole: string, changedBy: string) {
  const supabase = await createClient();

  // Validar el rol
  if (!['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'].includes(newRole)) {
    return { success: false, error: 'Rol inválido' };
  }

  console.log(' [changeUserRole] Cambiando rol de', userId, 'a', newRole);

  // Actualizar el rol en profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    console.error('❌ [changeUserRole] Error actualizando profile:', profileError);
    return { success: false, error: profileError.message };
  }

  console.log('✅ [changeUserRole] Profile actualizado correctamente');

  // Actualizar el rol en auth.users metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole }
  });

  if (authError) {
    console.error('⚠️ [changeUserRole] Error actualizando auth metadata:', authError);
    // No fallar, el perfil ya se actualizó
  }

  // Crear notificación para el usuario - SOLUCIÓN ALTERNATIVA
  try {
    console.log('📮 [changeUserRole] Creando notificación...');
    
    const notificationData = {
      user_id: userId,
      type: 'ROLE_CHANGED',
      title: 'Tu rol ha sido actualizado',
      message: `Tu rol ha sido cambiado a ${newRole} por un administrador.`,
      data: {
        newRole,
        changedBy,
        changedAt: new Date().toISOString()
      },
      read: false
    };

    const { data: insertedNotification, error: notifError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select();

    if (notifError) {
      console.error('❌ [changeUserRole] Error creando notificación:', notifError);
      console.error('Detalles:', notifError.details);
      console.error('Hint:', notifError.hint);
      console.error('Code:', notifError.code);
    } else {
      console.log('✅ [changeUserRole] Notificación creada exitosamente:', insertedNotification);
    }
  } catch (error) {
    console.error('❌ [changeUserRole] Excepción al crear notificación:', error);
  }

  revalidatePath('/admin/users');
  revalidatePath('/dashboard');
  
  return { success: true };
}

/**
 * Activar/Desactivar usuario
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error toggling user status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Obtener notificaciones no leídas del usuario actual
 */
export async function getUnreadNotifications() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('👤 [getUnreadNotifications] Usuario actual:', user?.id);
  
  if (!user) {
    console.log('❌ [getUnreadNotifications] No hay usuario autenticado');
    return { success: false, data: [] };
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [getUnreadNotifications] Error:', error);
    return { success: false, data: [] };
  }

  console.log('✅ [getUnreadNotifications] Notificaciones encontradas:', notifications?.length || 0);
  return { success: true, data: notifications || [] };
}