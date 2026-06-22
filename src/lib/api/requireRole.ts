import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const ALLOWED_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

type RequireRoleSuccess = {
    supabase: Awaited<ReturnType<typeof createClient>>;
    userId: string;
    role: AllowedRole;
};

type RequireRoleFailure = {
    error: NextResponse;
};

export async function requireRole(): Promise<RequireRoleSuccess | RequireRoleFailure> {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            error: NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 }),
        };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return {
            error: NextResponse.json({ error: 'No se encontró el perfil del usuario.' }, { status: 403 }),
        };
    }

    if (!profile.is_active) {
        return {
            error: NextResponse.json({ error: 'Tu cuenta está inactiva.' }, { status: 403 }),
        };
    }

    const role = String(profile.role).toUpperCase();
    if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        return {
            error: NextResponse.json(
                { error: 'No tienes permisos para esta operación. Solo Administrador o Encargado.' },
                { status: 403 }
            ),
        };
    }

    return { supabase, userId: user.id, role: role as AllowedRole };
}