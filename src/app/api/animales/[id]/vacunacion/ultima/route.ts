import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 [GET] Última vacunación para animal:', id);

    const supabase = await createClient();

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

    // Obtener la última vacunación
    const { data, error } = await supabase
      .from('vaccination_records')
      .select('*')
      .eq('animal_id', id)
      .order('applied_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ [GET] Error al obtener última vacunación:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay vacunaciones registradas' },
        { status: 404 }
      );
    }

    const record = data[0];
    console.log('✅ [GET] Última vacunación encontrada:', record);

    return NextResponse.json({
      success: true,
      date: new Date(record.applied_at).toLocaleDateString('es-ES'),
      name: record.vaccine_name,
      id: record.id,
    });

  } catch (error) {
    console.error('❌ [GET] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}