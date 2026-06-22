import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🚀 POST vacunacion para animal:', id);

    const supabase = await createClient();
    const body = await request.json();
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));

    // Verificar que el animal existe
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single();

    if (animalError || !animal) {
      console.error('❌ Animal no encontrado:', animalError);
      return NextResponse.json(
        { success: false, error: 'Animal no encontrado' },
        { status: 404 }
      );
    }
    console.log('✅ Animal encontrado');

    // Validar datos requeridos
    if (!body.vaccine_name) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la vacuna es obligatorio' },
        { status: 400 }
      );
    }

    if (!body.applied_at) {
      return NextResponse.json(
        { success: false, error: 'La fecha de aplicación es obligatoria' },
        { status: 400 }
      );
    }

    if (!body.responsible) {
      return NextResponse.json(
        { success: false, error: 'El responsable es obligatorio' },
        { status: 400 }
      );
    }

    // Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Usuario no autenticado:', userError);
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }
    console.log('✅ Usuario autenticado:', user.id);

    // Construir el registro con los nombres de columna CORRECTOS
    const record = {
      animal_id: id,
      vaccine_name: body.vaccine_name,
      supply_id: body.supply_id || null,
      quantity_used: Number(body.quantity_used) || 0,
      unit: body.unit || 'ml',
      applied_at: body.applied_at,
      next_dose_date: body.next_dose_date || null,
      responsible: body.responsible,
      notes: body.notes || null,
      lot_number: body.lot_number || null,
      dose_number: Number(body.dose_number) || 1,
      cost: body.cost || null,
      registered_by: user.id,
      created_at: new Date().toISOString(),
    };
    console.log('📝 Registro a insertar:', JSON.stringify(record, null, 2));

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('vaccination_records')
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
    console.log('✅ Vacuna guardada:', data);

    // Actualizar estado de vacunación del animal
    const { error: updateError } = await supabase
      .from('animals')
      .update({
        vaccination_status: 'al_dia',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.warn('⚠️ Error al actualizar estado:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Vacuna registrada correctamente',
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 [GET] Vacunaciones para animal:', id);

    const supabase = await createClient();
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Verificar que el animal existe
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single();

    if (animalError || !animal) {
      console.error('❌ [GET] Animal no encontrado:', animalError);
      return NextResponse.json(
        { success: false, error: 'Animal no encontrado' },
        { status: 404 }
      );
    }

    // Obtener vacunaciones del animal
    const { data, error, count } = await supabase
      .from('vaccination_records')
      .select('*', { count: 'exact' })
      .eq('animal_id', id)
      .order('applied_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ [GET] Error al obtener vacunaciones:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    console.log('✅ [GET] Vacunaciones encontradas:', data?.length || 0);

    // Formatear registros para el frontend
    const records = (data || []).map(record => ({
      id: record.id,
      vaccine_name: record.vaccine_name,
      application_date: record.applied_at,
      next_dose: record.next_dose_date,
      responsible: record.responsible,
      notes: record.notes,
      batch: record.lot_number,
      quantity: record.quantity_used,
      unit: record.unit,
      status: 'aplicada',
      dose_number: record.dose_number,
      cost: record.cost,
    }));

    return NextResponse.json({
      success: true,
      records: records,
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('❌ [GET] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}