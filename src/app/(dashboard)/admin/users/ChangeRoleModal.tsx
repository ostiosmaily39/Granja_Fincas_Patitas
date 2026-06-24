'use client';

import { useState } from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';

interface ChangeRoleModalProps {
  user: any;
  onClose: () => void;
  onConfirm: (newRole: string) => void;
  loading: boolean;
}

export default function ChangeRoleModal({ user, onClose, onConfirm, loading }: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const roles = [
    { value: 'ADMINISTRADOR', label: 'Administrador', description: 'Acceso total al sistema', color: 'purple' },
    { value: 'ENCARGADO', label: 'Encargado', description: 'Gestión operativa de la granja', color: 'green' },
    { value: 'EMPLEADO', label: 'Empleado', description: 'Registro de actividades básicas', color: 'gray' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cambiar Rol</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Cambiando rol de: <span className="font-semibold">{user.email}</span>
          </p>

          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === role.value
                    ? 'border-[var(--brand)] bg-[var(--brand)]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{role.label}</div>
                  <div className="text-sm text-gray-600">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedRole !== user.role && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm mb-1">
                  Se enviará una notificación
                </p>
                <p className="text-xs text-amber-700">
                  El usuario recibirá una notificación en su dashboard sobre este cambio de rol.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedRole)}
            disabled={loading || selectedRole === user.role}
            className="flex-1 px-4 py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cambiando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}