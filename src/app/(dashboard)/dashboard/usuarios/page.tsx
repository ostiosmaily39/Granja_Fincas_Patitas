'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile, Rol, RolEnum, ROL_OPTIONS } from '@/types/domain/user.schema';
import { profileService } from '@/services/profileService';
import { RoleGuard } from '@/components/RoleGuard';
import { Users, UserCog, AlertCircle, Loader2, Phone, MapPin, UserPlus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await profileService.listarPerfiles();
      setUsuarios(data);
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      setError(errorStr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Rol) => {
    try {
      setUpdatingId(userId);
      await profileService.actualizarRol(userId, newRole);
      setUsuarios(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : String(err);
      alert(`Error al actualizar el rol: ${errorStr}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(userId);
      // Asumiendo que el servicio tiene un método toggleStatus, u omitimos esto visualmente por ahora
      // await profileService.toggleStatus(userId, !currentStatus);
      
      // Simulando cambo local por ahora
      setUsuarios(prev => 
        prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u)
      );
    } catch (err: any) {
      alert(`Error al actualizar el estado: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      key: 'user',
      header: 'Usuario',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E4EFE4]/60 flex items-center justify-center text-lg font-black text-[var(--brand)] uppercase">
            {u.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-extrabold text-gray-900">{u.full_name || 'Sin nombre'}</p>
            <p className="text-xs font-bold text-gray-400">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contacto',
      render: (u) => <span className="font-medium text-gray-500">{u.phone || 'No registrado'}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => {
        let variant: 'purple' | 'info' | 'neutral' = 'neutral';
        if (u.role === 'ADMINISTRADOR') variant = 'purple';
        if (u.role === 'ENCARGADO') variant = 'info';
        
        return <Badge variant={variant} dot>{u.role}</Badge>;
      }
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => (
        <Badge variant={u.is_active ? 'success' : 'danger'} dot>
          {u.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-3 items-center">
          {updatingId === u.id ? (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--brand)]" />
          ) : (
            <>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value as Rol)}
                className="bg-gray-50 border border-black/5 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-[var(--brand)] outline-none cursor-pointer"
              >
                {ROL_OPTIONS.map(rol => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>
              <button 
                onClick={() => handleToggleStatus(u.id, u.is_active)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
              >
                {u.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Personal y Usuarios"
          description="Administra los accesos y roles de los usuarios del sistema. Desactiva cuentas cuando sea necesario."
          icon={Users}
          actions={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <UserPlus size={18} />
              <span>Nuevo Usuario</span>
            </button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
          </div>
        ) : error ? (
           <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 font-bold">
            {error}
           </div>
        ) : (
          <DataTable 
            columns={columns}
            data={usuarios}
            keyExtractor={(u) => u.id}
          />
        )}

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Crear Nuevo Usuario"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Nombre Completo</label>
              <input type="text" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Correo Electrónico</label>
              <input type="email" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="juan@ejemplo.com" />
            </div>
             <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Rol Inicial</label>
              <select className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[var(--brand)] outline-none uppercase">
                {ROL_OPTIONS.map(rol => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm">Enviar Invitación</button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
