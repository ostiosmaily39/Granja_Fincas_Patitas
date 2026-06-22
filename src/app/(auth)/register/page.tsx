import Link from 'next/link';
import { signup } from '@/actions/auth';
import { Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
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
        <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
            <Sprout size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Granja Fincas y Patitas</span>
        </div>

        <div className="max-w-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 drop-shadow-lg">
            Únete a la evolución <br /> 
            <span className="text-white/80">ganadera.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed font-medium">
            Empieza hoy mismo a digitalizar tu producción. Controla tu inventario, personal y actividades desde un solo lugar.
          </p>
        </div>
      </div>

      {/* REGISTER CARD SECTION (RIGHT) */}
      <div className="relative z-10 w-full md:w-[500px] lg:w-[600px] min-h-screen flex items-center justify-center p-6 md:pr-12 lg:pr-24">
        <div className="glass-panel w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-white/20 flex flex-col gap-6 bg-white/70 my-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600 font-medium">Únete a nuestra comunidad de granjeros modernos.</p>
          </div>

          <form action={signup} className="flex flex-col gap-4">
            {message && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-4 rounded-xl text-center font-medium animate-pulse">
                {message}
              </div>
            )}
            
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

            <button 
              type="submit" 
              className="mt-2 w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              Comenzar ahora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 text-gray-600">
              <ShieldCheck size={20} className="text-gray-400" />
              <p className="text-[11px] leading-tight font-medium opacity-80">
                Al registrarte, aceptas nuestros términos de servicio y políticas de privacidad de datos ganaderos.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-gray-500 font-medium">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-bold text-[var(--brand)] hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
