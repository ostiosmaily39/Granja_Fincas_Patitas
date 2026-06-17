import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Actualizamos la request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          // Actualizamos la response para que el navegador guarde las cookies refrescadas
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener el usuario actual (refrésca el token bajo el capó si es necesario)
  // Siempre usar getUser() y no getSession() para mayor seguridad en SSR
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Definición de rutas de autenticación
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/auth') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/update-password');

  // Lógica global de protección de rutas (Autorización):
  
  // 1. Si NO hay usuario y NO está en una ruta pública (como login), bloquear y llevar a login
  if (!user && !isAuthPage) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Si SÍ hay usuario, validar permisos y roles
  if (user) {
    // Si intenta ir a /login ya estando autenticado, llevarlo al dashboard
    if (isAuthPage) {
      url.pathname = '/dashboard'; 
      return NextResponse.redirect(url);
    }

    // Validación de ROLES (RBAC) para rutas del dashboard
    if (pathname.startsWith('/dashboard')) {
      // Consultar el rol en la tabla 'profiles'
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role;

      // Definición de rutas restringidas
      const adminOnlyRoutes = ['/dashboard/usuarios', '/dashboard/configuracion'];
      const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

      // Si es una ruta de Admin y el usuario NO es ADMINISTRADOR, denegar acceso
      if (isAdminRoute && userRole !== 'ADMINISTRADOR') {
        url.pathname = '/acceso-denegado';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
