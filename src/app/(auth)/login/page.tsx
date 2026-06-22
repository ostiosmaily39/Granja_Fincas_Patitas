import Link from 'next/link';
import { login } from '@/actions/auth';
import { Tractor, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-between">
      {/* BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center grayscale-[0.2]" 
        style={{ 
          backgroundImage: "url('/assets/auth/finca-vaca.jpg')",
          backgroundPosition: 'center 40%' 
        }}
      >
        {/* Overlay para legibilidad y tono de marca */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent md:to-transparent"></div>
      </div>

      {/* BRANDING SECTION (LEFT) */}
      <div className="relative z-10 hidden md:flex flex-col justify-between h-full p-12 lg:p-20 w-1/2 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Tractor size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Granja Fincas y Patitas</span>
        </div>

        <div className="max-w-xl animate-fade-in">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 drop-shadow-lg">
            Gestión de precisión <br /> 
            <span className="text-white/80">para la finca moderna.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed font-medium">
            Potenciando el control de inventario y producción con datos reales. Eficiencia sin esfuerzo en la palma de tu mano.
          </p>
        </div>
      </div>

      {/* LOGIN CARD SECTION (RIGHT) */}
      <div className="relative z-10 w-full md:w-[500px] lg:w-[600px] h-full flex items-center justify-center p-6 md:pr-12 lg:pr-24">
        <div className="glass-panel w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-white/20 flex flex-col gap-8 bg-white/70">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Ingresar</h2>
            <p className="text-gray-600 font-medium">Accede al panel de administración de tu granja.</p>
          </div>

          <form action={login} className="flex flex-col gap-5">
            {message && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-4 rounded-xl text-center font-medium animate-pulse">
                {message}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1" htmlFor="email">
                Correo electrónico
              </label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                required 
                placeholder="ej: administrador@granja.com"
                className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="password">
                  Contraseña
                </label>
                <a href="/forgot-password" title="password" className="text-xs font-bold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input 
                type="password" 
                name="password" 
                id="password" 
                required 
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-gray-600 font-medium cursor-pointer">Recordarme</label>
            </div>

            <button 
              type="submit" 
              className="mt-4 w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              Ingresar
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 text-gray-600">
              <ShieldCheck size={20} className="text-gray-400" />
              <p className="text-[11px] leading-tight font-medium opacity-80">
                Tu sesión está protegida por encriptación de grado industrial. 
                Tus datos permanecen privados y seguros.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-gray-500 font-medium">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-bold text-[var(--brand)] hover:underline">
                  Regístrate aquí
                </Link>
              </p>
              
              <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <a href="#" className="hover:text-gray-600 transition-colors">Soporte</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Privacidad</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Términos</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
