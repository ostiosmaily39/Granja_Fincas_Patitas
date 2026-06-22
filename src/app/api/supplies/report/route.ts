import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api/requireRole';

interface SupplyForReport {
    id: string;
    name: string;
    current_stock: number | string;
    unit_price: number | string | null;
    expiry_date: string | null;
    supply_categories: { category: string; name: string } | null;
}

interface MovementForReport {
    quantity: number | string;
    supplies: { supply_categories: { name: string } | null } | null;
}

export async function GET(request: NextRequest) {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    const sp = request.nextUrl.searchParams;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const defaultFrom = new Date(today.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
    const from = sp.get('from') ?? defaultFrom;
    const to = sp.get('to') ?? todayStr;

    const { data: suppliesRaw, error: suppliesErr } = await supabase
        .from('supplies')
        .select('id, name, current_stock, unit_price, expiry_date, supply_categories ( category, name )')
        .eq('is_active', true);

    if (suppliesErr) return NextResponse.json({ error: suppliesErr.message }, { status: 500 });
    const supplies = (suppliesRaw ?? []) as unknown as SupplyForReport[];

    const totalValuation = supplies.reduce(
        (sum, s) => sum + (s.unit_price != null ? Number(s.unit_price) : 0) * Number(s.current_stock),
        0
    );

    const in30 = new Date(today.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
    const expiringSoon = supplies.filter(
        (s) => s.expiry_date && s.expiry_date >= todayStr && s.expiry_date <= in30
    );
    const expired = supplies.filter((s) => s.expiry_date && s.expiry_date < todayStr);

    const { data: movementsRaw, error: movErr } = await supabase
        .from('stock_movements')
        .select('quantity, supplies ( supply_categories ( name ) )')
        .eq('movement_type', 'salida')
        .gte('created_at', from)
        .lte('created_at', `${to}T23:59:59`);

    if (movErr) return NextResponse.json({ error: movErr.message }, { status: 500 });
    const movements = (movementsRaw ?? []) as unknown as MovementForReport[];

    const consumptionByCategory: Record<string, number> = {};
    for (const m of movements) {
        const catName = m.supplies?.supply_categories?.name ?? 'Sin categoría';
        consumptionByCategory[catName] = (consumptionByCategory[catName] ?? 0) + Number(m.quantity);
    }

    return NextResponse.json({
        data: {
            period: { from, to },
            total_supplies: supplies.length,
            total_valuation: Number(totalValuation.toFixed(2)),
            expiring_soon: expiringSoon.map((s) => ({ id: s.id, name: s.name, expiry_date: s.expiry_date })),
            expired: expired.map((s) => ({ id: s.id, name: s.name, expiry_date: s.expiry_date })),
            consumption_by_category: Object.entries(consumptionByCategory).map(([category, total]) => ({
                category,
                total,
            })),
        },
    });
}