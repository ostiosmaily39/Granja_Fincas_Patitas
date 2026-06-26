import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🚀 POST alimentacion para animal:', id);

    const supabase = await createClient();
    const body = await request.json();
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));

    // Verificar animal
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single();

    if (animalError || !animal) {
      return NextResponse.json(
        { success: false, error: 'Animal no encontrado' },
        { status: 404 }
      );
    }

    if (!body.supply_id) {
      return NextResponse.json(
        { success: false, error: 'El insumo es obligatorio' },
        { status: 400 }
      );
    }

    if (!body.fed_at) {
      return NextResponse.json(
        { success: false, error: 'La fecha y hora del suministro es obligatoria' },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const { data: supply, error: supplyError } = await supabase
      .from('supplies')
      .select('*')
      .eq('id', body.supply_id)
      .single();

    if (supplyError || !supply) {
      return NextResponse.json(
        { success: false, error: 'Insumo no encontrado' },
        { status: 404 }
      );
    }

    if (body.quantity > supply.current_stock) {
      return NextResponse.json(
        { success: false, error: `Stock insuficiente. Disponible: ${supply.current_stock} ${supply.unit}` },
        { status: 400 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const record = {
      animal_id: id,
      supply_id: body.supply_id,
      quantity: body.quantity,
      unit: body.unit || supply.unit || 'kg',
      fed_at: body.fed_at,
      notes: body.notes || null,
      registered_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('feeding_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar:', error);
      return NextResponse.json(
        { success: false, error: `Error de base de datos: ${error.message}` },
        { status: 500 }
      );
    }

    const newStock = Math.max(supply.current_stock - body.quantity, 0);
    await supabase
      .from('supplies')
      .update({ current_stock: newStock })
      .eq('id', body.supply_id);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Alimentación registrada correctamente',
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}