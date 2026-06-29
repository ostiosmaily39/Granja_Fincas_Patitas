'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { signup } from '@/actions/auth';
import RoleSelector from '@/components/auth/RoleSelector';

type Role = 'ENCARGADO' | 'EMPLEADO';

interface RegisterFormProps {
  message?: string;
}

export default function RegisterForm({ message }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  // PASO 1: Selección de rol
  if (step === 1) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  // PASO 2: Formulario de registro
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
        <p className="text-gray-600 font-medium">
          Rol seleccionado:{' '}
          <span className="font-bold text-[var(--brand)]">
            {selectedRole === 'ENCARGADO' ? 'ENCARGADO' : 'EMPLEADO'}
          </span>
        </p>
      </div>

      <form action={signup} className="flex flex-col gap-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-4 rounded-xl text-center font-medium animate-pulse">
            {message}
          </div>
        )}

        {/* Campo oculto para el rol */}
        <input type="hidden" name="role" value={selectedRole || ''} />
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="full_name">
            Nombre Completo
          </label>
          <input 
            type="text" 
            name="full_name" 
            id="full_name" 
            required 
            placeholder="ej: Juan Pérez"
            className="w-full px-5 py-3.5 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="phone">
            Teléfono / WhatsApp
          </label>
          <input 
            type="tel" 
            name="phone" 
            id="phone" 
            placeholder="ej: +57 300 123 4567"
            className="w-full px-5 py-3.5 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="email">
            Correo electrónico
          </label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required 
            placeholder="ej: juan@granja.com"
            className="w-full px-5 py-3.5 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="password">
            Contraseña
          </label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required 
            placeholder="••••••••"
            minLength={6}
            className="w-full px-5 py-3.5 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400"
          />
          <p className="text-[10px] text-gray-400 ml-1">Mínimo 6 caracteres</p>
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            type="button"
            onClick={handleBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-2xl transition-all"
          >
            Atrás
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            Comenzar ahora
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}