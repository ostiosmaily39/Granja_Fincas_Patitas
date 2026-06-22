'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClearParams() {
  const pathname = usePathname();

  useEffect(() => {
    // Al montarse, actualizamos SOLAMENTE la barra de direcciones del navegador
    // evitando usar router.replace(). Así, Next.js no se entera del cambio
    // y no re-renderiza la página (el error/éxito se queda fijo).
    // Pero si el usuario presiona F5, el navegador leerá esta URL limpia
    // y hará una petición limpia al servidor.
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', pathname);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
