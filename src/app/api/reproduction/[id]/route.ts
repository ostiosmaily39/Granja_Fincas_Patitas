import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Verificar sesión
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Verificar rol ADMINISTRADOR
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'ADMINISTRADOR') {
            return NextResponse.json(
                { error: 'Solo el administrador puede eliminar cruces' },
                { status: 403 }
            );
        }

        // Eliminar el evento
        const repo = new SupabaseReproductionRepository(supabase);
        await repo.delete(id);

        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 500 }
        );
    }
}