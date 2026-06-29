import { getAllUsers } from '@/actions/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import UsersList from './UsersList';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  // Verificar que el usuario sea administrador
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMINISTRADOR') {
    redirect('/dashboard');
  }

  // Obtener todos los usuarios
  const result = await getAllUsers();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          Error al cargar usuarios: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra los usuarios y sus roles en el sistema</p>
      </div>

      <UsersList users={result.data} currentUserId={user.id} />
    </div>
  );
}