import Link from 'next/link';
import { resetPassword } from '@/actions/auth';
import { Tractor } from 'lucide-react';
import ClearParams from '@/components/ui/ClearParams';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const message = params?.message;
  const success = params?.success;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="h-12 w-12 rounded-full bg-[var(--brand)] flex items-center justify-center text-white mb-2 shadow-lg">
          <Tractor size={28} />
        </div>
        <h1 className="text-2xl font-bold text-center">Recuperar Contraseña</h1>
        <p className="text-sm text-center opacity-80">Te enviaremos un enlace de recuperación</p>
      </div>

      <form action={resetPassword} className="flex flex-col gap-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg text-center relative overflow-hidden">
            {message}
            <ClearParams />
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-600 text-sm p-3 rounded-lg text-center relative overflow-hidden">
            {success}
            <ClearParams />
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="email">Correo electrónico</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required 
            placeholder="tumail@ejemplo.com"
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium py-2.5 rounded-lg transition-colors shadow-md"
        >
          Enviar Enlace
        </button>
      </form>

      <div className="mt-4 text-center text-sm opacity-80">
        <Link href="/login" className="font-semibold text-[var(--brand-hover)] hover:underline">
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
