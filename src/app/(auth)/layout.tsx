export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* 
          El diseño ahora es de pantalla completa. 
          Las páginas individuales pueden inyectar sus propios fondos 
          o estructuras complejas (como el formulario a la derecha). 
      */}
      <div className="z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
