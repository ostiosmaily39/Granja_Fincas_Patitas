import Link from 'next/link';
import { Sprout, ArrowRight, ShieldCheck } from 'lucide-react';
import RegisterForm from './RegisterForm';

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
          <RegisterForm message={message} />

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