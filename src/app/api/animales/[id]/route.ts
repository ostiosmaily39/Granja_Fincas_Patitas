import { NextResponse } from 'next/server';
import { apiSuccess, apiError, getAuthUser } from '@/lib/api-helpers';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;
    const repo = new SupabaseAnimalRepository(supabase);
    const animal = await repo.getById(id);
    
    if (!animal) {
      return apiError('Animal no encontrado', 404);
    }
    
    return apiSuccess(animal);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 500;
    return apiError(message, status);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await getAuthUser();
    const { id } = await params;
    
    // ✅ Parsear el body sin usar Zod
    const body = await request.json();
    
    const repo = new SupabaseAnimalRepository(supabase);
    const oldAnimal = await repo.getById(id);
    
    if (!oldAnimal) {
      return apiError('Animal no encontrado', 404);
    }
    
    // ✅ Filtrar solo los campos permitidos
    const allowedFields = [
      'name', 'current_weight_kg', 'health_status', 
      'vaccination_status', 'reproductive_status', 'status', 
      'breed_id', 'notes', 'egress_notes'
    ];
    
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    
    const updatedAnimal = await repo.update(id, updateData);
    
    // RF011: Calcular campos cambiados para confirmación y trazabilidad
    const changedFields: string[] = [];
    const previousValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    
    for (const key of Object.keys(updateData)) {
      const oldVal = (oldAnimal as any)[key];
      const newVal = (updatedAnimal as any)[key];
      if (oldVal !== newVal && newVal !== undefined) {
        changedFields.push(key);
        previousValues[key] = oldVal;
        newValues[key] = newVal;
      }
    }
    
    // Si hubo cambios, registramos el evento de actualización
    if (changedFields.length > 0) {
      await supabase.from('animal_events').insert({
        animal_id: id,
        event_type: 'actualizacion',
        event_date: new Date().toISOString(),
        title: 'Datos actualizados',
        description: `Campos modificados: ${changedFields.join(', ')}`,
        metadata: {
          changedFields,
          previousValues,
          newValues
        },
        performed_by: user.id,
      });
    }

    return apiSuccess(updatedAnimal, {
      changedFields,
      previousValues,
      newValues,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 400;
    return apiError(message, status);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await getAuthUser();
    const { id } = await params;
    const repo = new SupabaseAnimalRepository(supabase);

    const existing = await repo.getById(id);
    if (!existing) {
      return apiError('Animal no encontrado', 404);
    }

    // Intentar leer un body opcional con notas
    let notes: string | undefined;
    try {
      const maybe = await request.json();
      if (maybe && typeof maybe.notes === 'string') notes = maybe.notes;
    } catch (_) {
      // ignore: no body
    }

    const updated = await repo.changeStatus(id, 'descartado', notes);

    // Registrar evento de egreso
    await supabase.from('animal_events').insert({
      animal_id: id,
      event_type: 'egreso',
      event_date: new Date().toISOString(),
      title: 'Animal descartado',
      description: notes ?? 'Egreso por eliminación vía API',
      metadata: { previousStatus: existing.status, newStatus: 'descartado' },
      performed_by: user.id,
    });

    return apiSuccess(updated, { message: 'Animal descartado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message === 'No autorizado' ? 401 : 400;
    return apiError(message, status);
  }
}