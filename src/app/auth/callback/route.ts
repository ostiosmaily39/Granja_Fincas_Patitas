import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Authentication successful => redirect to exactly what's in `next` or home
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si hay error en el codigo o no vino
  return NextResponse.redirect(`${origin}/login?message=El enlace de verificación es inválido o ha expirado`);
}
