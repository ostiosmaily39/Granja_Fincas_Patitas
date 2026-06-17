'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí se podría enviar el error a un servicio de monitoreo (ej. Sentry)
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 shadow-inner">
        <AlertTriangle size={40} />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Ocurrió un error inesperado al cargar esta sección. Por favor, intenta de nuevo o regresa al inicio.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium rounded-xl transition-all shadow-md active:scale-95"
        >
          <RefreshCcw size={18} />
          Intentar de nuevo
        </button>
        
        <Link 
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Home size={18} />
          Ir al Inicio
        </Link>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-gray-100 rounded-lg text-left max-w-2xl overflow-auto border border-gray-200">
          <p className="text-xs font-mono text-red-600 mb-2 font-bold uppercase tracking-wider">Error Details (Dev Only):</p>
          <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">{error.message}</pre>
        </div>
      )}
    </div>
  );
}
