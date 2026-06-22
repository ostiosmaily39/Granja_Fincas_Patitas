import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api/requireRole';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRole();
    if ('error' in auth) return auth.error;
    const { supabase } = auth;
    const { id } = await params;

    const sp = request.nextUrl.searchParams;
    const from = sp.get('from');
    const to = sp.get('to');
    const type = sp.get('type');

    const { data, error } = await supabase.rpc('fn_supply_movements', {
        p_supply_id: id,
        ...(from ? { p_start_date: from } : {}),
        ...(to ? { p_end_date: to } : {}),
        p_type: type && type !== 'all' ? type : null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
}