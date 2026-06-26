import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api/requireRole';

interface AlertRow {
    id: string;
    alert_type: string;
    threshold_value: number | string;
    current_value: number | string;
    created_at: string;
    supplies: {
        id: string;
        name: string;
        unit: string;
        min_stock: number | string;
        current_stock: number | string;
        expiry_date: string | null;
    } | null;
}

export async function GET() {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    // Sincroniza alertas de vencimiento antes de leer
    // (el cron que las genera está comentado en el SQL, así que lo llamamos aquí)
    await supabase.rpc('fn_check_expiry_alerts');

    const { data: alertsRaw, error } = await supabase
        .from('stock_alerts')
        .select(
            `id, alert_type, threshold_value, current_value, created_at,
       supplies!inner ( id, name, unit, min_stock, current_stock, expiry_date,
         supply_categories!inner ( category ) )`
        )
        .eq('status', 'activa')
        .eq('supplies.supply_categories.category', 'alimento')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const alerts = (alertsRaw ?? []) as unknown as AlertRow[];

    const supplyIds = [...new Set(alerts.map((a) => a.supplies?.id).filter(Boolean))] as string[];
    const consumptionRate: Record<string, number> = {};

    if (supplyIds.length > 0) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
        const { data: recentMovements } = await supabase
            .from('stock_movements')
            .select('supply_id, quantity')
            .eq('movement_type', 'salida')
            .in('supply_id', supplyIds)
            .gte('created_at', sevenDaysAgo);

        for (const m of recentMovements ?? []) {
            consumptionRate[m.supply_id] = (consumptionRate[m.supply_id] ?? 0) + Number(m.quantity);
        }
    }

    const data = alerts.map((a) => ({
        id: a.id,
        alert_type: a.alert_type,
        supply_id: a.supplies?.id,
        supply_name: a.supplies?.name,
        unit: a.supplies?.unit,
        current_stock: a.supplies ? Number(a.supplies.current_stock) : null,
        min_stock: a.supplies ? Number(a.supplies.min_stock) : null,
        expiry_date: a.supplies?.expiry_date ?? null,
        weekly_consumption: a.supplies?.id ? consumptionRate[a.supplies.id] ?? 0 : 0,
        created_at: a.created_at,
    }));

    return NextResponse.json({ data });
}