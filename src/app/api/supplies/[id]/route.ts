import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api/requireRole';
import { UpdateSupplySchema } from '@/types/domain/inventory.schema';

// current_stock NUNCA se actualiza aquí: la base de datos lo gestiona
// vía triggers sobre stock_movements (ver .../stock/route.ts).
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase } = auth;
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
    }

    const parsed = UpdateSupplySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos.', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    if (Object.keys(parsed.data).length === 0) {
        return NextResponse.json({ error: 'No hay cambios para guardar.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('supplies')
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(
            'id, code, name, unit, current_stock, min_stock, unit_price, expiry_date, supplier, batch_number, notes, category_id, updated_at'
        )
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
        return NextResponse.json({ error: 'Insumo no encontrado.' }, { status: 404 });
    }

    // Resincronizar alertas tras editar fecha de vencimiento
    await supabase.rpc('fn_check_expiry_alerts');

    return NextResponse.json({ data });
}