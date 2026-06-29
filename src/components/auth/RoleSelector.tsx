'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

type Role = 'ENCARGADO' | 'EMPLEADO';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Cómo usarás el aplicativo?</h2>
        <p className="text-gray-600 font-medium">Selecciona tu rol para continuar</p>
      </div>

      <div className="space-y-4">
        {/* Opción ENCARGADO */}
        <button
          type="button"
          onClick={() => setSelectedRole('ENCARGADO')}
          className={`w-full relative flex items-center gap-4 p-6 border-2 rounded-2xl transition-all ${
            selectedRole === 'ENCARGADO'
              ? 'border-[var(--brand)] bg-[var(--brand)]/5 shadow-lg'
              : 'border-black/5 bg-gray-100/50 hover:border-[var(--brand)]/50'
          }`}
        >
          <div className="text-4xl">🏡</div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900">Gestionar mi granja</h3>
            <p className="text-sm text-gray-600 mt-1">ENCARGADO</p>
          </div>
          {selectedRole === 'ENCARGADO' && (
            <CheckCircle size={28} className="text-[var(--brand)]" />
          )}
        </button>

        {/* Opción EMPLEADO */}
        <button
          type="button"
          onClick={() => setSelectedRole('EMPLEADO')}
          className={`w-full relative flex items-center gap-4 p-6 border-2 rounded-2xl transition-all ${
            selectedRole === 'EMPLEADO'
              ? 'border-[var(--brand)] bg-[var(--brand)]/5 shadow-lg'
              : 'border-black/5 bg-gray-100/50 hover:border-[var(--brand)]/50'
          }`}
        >
          <div className="text-4xl">👷</div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900">Trabajar en una</h3>
            <p className="text-sm text-gray-600 mt-1">EMPLEADO</p>
          </div>
          {selectedRole === 'EMPLEADO' && (
            <CheckCircle size={28} className="text-[var(--brand)]" />
          )}
        </button>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
          selectedRole
            ? 'bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg active:scale-[0.98]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continuar
      </button>

      <p className="text-xs text-center text-gray-500 font-medium">
        Esto puedes cambiarlo después en tu configuración de perfil
      </p>
    </div>
  );
}