'use client';

import { useState } from 'react';
import { changeUserRole, toggleUserStatus } from '@/actions/admin';
import { User, MoreVertical, Search, Filter } from 'lucide-react';
import ChangeRoleModal from './ChangeRoleModal';

interface UsersListProps {
  users: any[];
  currentUserId: string;
}

export default function UsersList({ users, currentUserId }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleChangeRole = async (userId: string, newRole: string) => {
    setLoading(userId);
    const result = await changeUserRole(userId, newRole, currentUserId);
    
    if (result.success) {
      setShowRoleModal(false);
      setSelectedUser(null);
      window.location.reload(); // Recargar para ver los cambios
    } else {
      alert('Error al cambiar el rol: ' + result.error);
    }
    
    setLoading(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(userId);
    const result = await toggleUserStatus(userId, !currentStatus);
    
    if (!result.success) {
      alert('Error al cambiar el estado: ' + result.error);
    } else {
      window.location.reload();
    }
    
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Todos los roles</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="ENCARGADO">Encargados</option>
            <option value="EMPLEADO">Empleados</option>
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] flex items-center justify-center text-white font-bold text-lg">
                  {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">
                      {user.full_name || 'Sin nombre'}
                    </h3>
                    {user.id === currentUserId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Tú
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      user.role === 'ADMINISTRADOR' 
                        ? 'bg-purple-100 text-purple-700' 
                        : user.role === 'ENCARGADO'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                    
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      user.is_active 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {user.phone && (
                      <span className="text-xs text-gray-500">
                        📱 {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menú de acciones */}
              <div className="relative">
                <button
                  onClick={() => setSelectedUser(user)}
                  disabled={loading === user.id}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>

                {selectedUser?.id === user.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => {
                        setShowRoleModal(true);
                        setSelectedUser(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cambiar rol
                    </button>
                    
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => {
                          handleToggleStatus(user.id, user.is_active);
                          setSelectedUser(null);
                        }}
                        disabled={loading === user.id}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                      >
                        {user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onConfirm={(newRole) => handleChangeRole(selectedUser.id, newRole)}
          loading={loading === selectedUser.id}
        />
      )}
    </div>
  );
}