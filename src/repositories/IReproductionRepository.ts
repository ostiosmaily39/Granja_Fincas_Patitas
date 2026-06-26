import type {
  ReproductiveEvent,
  ReproductiveEventWithRelations,
  CreateReproductiveEventDTO,
  UpdateGestationStatusDTO,
  ReproductiveAnimalMini,
} from '@/types/domain/reproduction.schema';

export interface IReproductionRepository {
  /** Lista todos los eventos con datos de hembra y macho */
  list(): Promise<ReproductiveEventWithRelations[]>;

  /** Lista eventos de un animal específico (como hembra o como padre) */
  listByAnimal(animalId: string): Promise<ReproductiveEventWithRelations[]>;

  /** Crea un nuevo evento reproductivo — Implementación B */
  create(input: CreateReproductiveEventDTO): Promise<ReproductiveEvent>;

  /** Actualiza el estado de gestación de un evento */
  update(id: string, input: UpdateGestationStatusDTO): Promise<ReproductiveEvent>;

  /** Elimina un evento — solo para uso desde API Route con validación de rol */
  delete(id: string): Promise<void>;

  /** Lista animales por sexo para los selects del formulario */
  listAnimalsBySex(sex: 'hembra' | 'macho'): Promise<ReproductiveAnimalMini[]>;

  /** Resumen de estadísticas del módulo */
  getReproductionSummary(): Promise<{
    successfulBirths: number;
    activeGestations: number;
    failures: number;
  }>;
}