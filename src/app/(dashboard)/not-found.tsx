import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-[var(--brand-light)] rounded-full flex items-center justify-center text-[var(--brand)] mb-6 shadow-inner">
        <Search size={40} />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Esta sección no existe</h2>
      
      <p className="text-gray-500 max-w-md mb-8">
        Lo sentimos, no pudimos encontrar la página que buscas. Es posible que la ruta sea incorrecta o haya sido movida.
      </p>
      
      <Link 
        href="/dashboard"
        className="flex items-center gap-2 px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium rounded-xl transition-all shadow-md active:scale-95"
      >
        <ArrowLeft size={18} />
        Volver al Inicio
      </Link>
    </div>
  );
}
