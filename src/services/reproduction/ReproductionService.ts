import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type {
    CreateReproductiveEventDTO,
    UpdateGestationStatusDTO,
} from '@/types/domain/reproduction.schema';

const getRepo = () => new SupabaseReproductionRepository(createClient());

export const reproductionService = {
    /** Lista todos los eventos con relaciones de animales */
    list: () => getRepo().list(),

    /** Lista eventos de un animal específico */
    listByAnimal: (animalId: string) => getRepo().listByAnimal(animalId),

    /** Crea un nuevo evento reproductivo */
    create: (input: CreateReproductiveEventDTO) => getRepo().create(input),

    /** Actualiza el estado de gestación */
    update: (id: string, input: UpdateGestationStatusDTO) => getRepo().update(id, input),

    /** Elimina un evento — validación de rol debe hacerse antes de llamar */
    delete: (id: string) => getRepo().delete(id),

    /** Lista animales por sexo para los selects */
    listAnimalsBySex: (sex: 'hembra' | 'macho') => getRepo().listAnimalsBySex(sex),

    /** Resumen de estadísticas del módulo */
    getSummary: () => getRepo().getReproductionSummary(),
};