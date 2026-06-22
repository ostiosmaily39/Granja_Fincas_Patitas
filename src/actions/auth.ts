'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=No se pudo iniciar sesión');
  }

  return redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || 'Usuario Nuevo',
        phone: phone || '',
        role: 'EMPLEADO',
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect(`/register?message=${encodeURIComponent(error.message)}`);
  }

  // Si Supabase exige confirmación por correo, redirigimos instando a revisar la bandeja
  return redirect('/login?message=Revisa tu correo para verificar la cuenta');
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  return redirect('/login');
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  });
  if (error) {
    return redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`);
  }
  return redirect('/forgot-password?message=Revisa tu correo para restablecer la contraseña');
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return redirect(`/update-password?message=${encodeURIComponent(error.message)}`);
  }
  return redirect('/dashboard');
}
