import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();
    const body = await request.json();

    // Verificar que el animal existe
    const { data: existing, error: findError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Animal no encontrado' },
        { status: 404 }
      );
    }

    // ✅ Actualizar SOLO con name (sin nickname)
    const { data, error } = await supabase
      .from('animals')
      .update({
        name: body.name || null,
        current_weight_kg: body.current_weight_kg,
        health_status: body.health_status,
        vaccination_status: body.vaccination_status,
        reproductive_status: body.reproductive_status,
        status: body.status,
        breed_id: body.breed_id || null,
        notes: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error actualizando animal:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // ✅ Devolver datos actualizados + metadata
    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Animal actualizado correctamente',
      metadata: {
        timestamp: new Date().toISOString(),
        rows_affected: data.length,
        operation: 'UPDATE',
        table: 'animals',
      },
    });
  } catch (error) {
    console.error('Error en PUT /api/animals/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error en GET /api/animals/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}