import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api/requireRole';

interface SupplyRow {
    id: string;
    code: string;
    name: string;
    unit: string;
    current_stock: number | string;
    min_stock: number | string;
    expiry_date: string | null;
    unit_price: number | string | null;
    supply_categories: { name: string } | null;
}

export async function GET(request: NextRequest) {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page') ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit') ?? 10) || 10));
    const sort = sp.get('sort') || 'name';
    const order = sp.get('order') === 'desc' ? 'desc' : 'asc';
    const search = sp.get('search')?.trim();
    const category = sp.get('category');
    const expiryStatus = sp.get('expiryStatus');
    const stockStatus = sp.get('stockStatus');

    let query = supabase
        .from('supplies')
        .select(
            `id, code, name, unit, current_stock, min_stock, expiry_date, unit_price,
       supply_categories ( name )`,
            { count: 'exact' }
        )
        .eq('is_active', true)
        .order(sort, { ascending: order === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

    if (category && category !== 'all') {
        query = query.eq('category_id', category);
    }
    if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let supplies = ((data ?? []) as unknown as SupplyRow[]).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        current_stock: Number(row.current_stock),
        min_stock: Number(row.min_stock),
        unit: row.unit,
        expiry_date: row.expiry_date ?? null,
        unit_price: row.unit_price != null ? Number(row.unit_price) : null,
        category_name: row.supply_categories?.name ?? '—',
    }));

    // Nota: igual que el repositorio SDK anterior, estos dos filtros se
    // aplican sobre la página ya traída (limitación heredada del diseño
    // original, no introducida aquí).
    if (expiryStatus && expiryStatus !== 'all') {
        const today = new Date();
        supplies = supplies.filter((s) => {
            if (!s.expiry_date) return false;
            const diffDays = Math.ceil((new Date(s.expiry_date).getTime() - today.getTime()) / 86_400_000);
            if (expiryStatus === 'vencido') return diffDays < 0;
            if (expiryStatus === 'proximo') return diffDays >= 0 && diffDays <= 90;
            if (expiryStatus === 'vigente') return diffDays > 90;
            return true;
        });
    }
    if (stockStatus && stockStatus !== 'all') {
        supplies = supplies.filter((s) =>
            stockStatus === 'bajo' ? s.current_stock <= s.min_stock : s.current_stock > s.min_stock
        );
    }

    const total = count ?? 0;
    return NextResponse.json({
        data: supplies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
}
