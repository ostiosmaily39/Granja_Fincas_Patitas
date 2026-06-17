import { updatePassword } from '@/actions/auth';
import { Tractor } from 'lucide-react';

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="h-12 w-12 rounded-full bg-[var(--brand)] flex items-center justify-center text-white mb-2 shadow-lg">
          <Tractor size={28} />
        </div>
        <h1 className="text-2xl font-bold text-center">Establecer Contraseña</h1>
        <p className="text-sm text-center opacity-80">Ingresa tu nueva contraseña para la cuenta</p>
      </div>

      <form action={updatePassword} className="flex flex-col gap-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg text-center">
            {message}
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="password">Nueva Contraseña</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required 
            minLength={6}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium py-2.5 rounded-lg transition-colors shadow-md"
        >
          Actualizar Contraseña
        </button>
      </form>
    </div>
  );
}
