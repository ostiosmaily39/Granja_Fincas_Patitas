import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/api/requireRole';

const STOCK_MOVEMENT_REASONS = [
    'compra',
    'consumo_animal',
    'tratamiento_veterinario',
    'vacunacion',
    'vencido',
    'perdida',
    'devolucion',
    'ajuste_inventario',
    'otro',
] as const;

const StockMovementSchema = z.object({
    movement_type: z.enum(['entrada', 'salida']),
    quantity: z.number().positive('La cantidad debe ser mayor a cero.'),
    reason: z.enum(STOCK_MOVEMENT_REASONS),
    animal_id: z.string().uuid().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    reference_number: z.string().max(120).nullable().optional(),
    supplier: z.string().max(160).nullable().optional(),
    unit_cost: z.number().nonnegative().nullable().optional(),
    new_expiry_date: z.string().nullable().optional(),
});

// Delega el cálculo de balance_before/balance_after en fn_add_stock /
// fn_deduct_stock (ya existentes en la base de datos).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase, userId } = auth;
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
    }

    const parsed = StockMovementSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos.', details: parsed.error.flatten() },
            { status: 400 }
        );
    }
    const input = parsed.data;

    if (input.movement_type === 'entrada') {
        const { data, error } = await supabase.rpc('fn_add_stock', {
            p_supply_id: id,
            p_quantity: input.quantity,
            p_reason: input.reason,
            p_reference_number: input.reference_number ?? null,
            p_supplier: input.supplier ?? null,
            p_unit_cost: input.unit_cost ?? null,
            p_new_expiry_date: input.new_expiry_date ?? null,
            p_notes: input.notes ?? null,
            p_user_id: userId,
        });

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ data: { movement_id: data } }, { status: 201 });
    }

    // salida
    const { data, error } = await supabase.rpc('fn_deduct_stock', {
        p_supply_id: id,
        p_quantity: input.quantity,
        p_reason: input.reason,
        p_animal_id: input.animal_id ?? null,
        p_notes: input.notes ?? null,
        p_user_id: userId,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { movement_id: data } }, { status: 201 });
}