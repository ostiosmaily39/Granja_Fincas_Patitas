import {
  HealthEvent,
  CreateHealthEventInput,
  AnimalEvent,
  AnimalTimelineFilter,
  VaccineScheme,
  CreateVaccineSchemeInput,
  VaccinationRecord,
  CreateVaccinationInput,
  VaccineAlert,
} from '@/types/domain/health.schema';

export interface IHealthRepository {
  /** Historial clínico detallado (tabla health_events) */
  getByAnimal(animalId: string): Promise<HealthEvent[]>;

  /** Alta de evento de salud + tratamientos opcionales (RF016) */
  addHealthEvent(input: CreateHealthEventInput): Promise<HealthEvent>;

  /** Línea de tiempo unificada por animal (animal_events, RF012) */
  getTimelineByAnimal(
    animalId: string,
    filter?: AnimalTimelineFilter
  ): Promise<AnimalEvent[]>;

  /** Alertas simples: animales con eventos de salud en tratamiento */
  getHealthAlerts(): Promise<unknown[]>;

  // ── VACUNACIÓN ────────────────────────────────────────────────────

  /** Lista todos los esquemas de vacunación, opcionalmente filtrados por especie */
  getVaccineSchemes(speciesId?: string): Promise<VaccineScheme[]>;

  /** Crea un nuevo esquema de vacunación */
  createVaccineScheme(input: CreateVaccineSchemeInput): Promise<VaccineScheme>;

  /** Actualiza un esquema de vacunación existente */
  updateVaccineScheme(id: string, input: Partial<CreateVaccineSchemeInput>): Promise<VaccineScheme>;

  /** Desactiva (soft delete) un esquema de vacunación */
  deleteVaccineScheme(id: string): Promise<void>;

  /** Registra una dosis aplicada a un animal, descuenta stock y actualiza estado */
  registerVaccination(input: CreateVaccinationInput): Promise<VaccinationRecord>;

  /** Historial de vacunas de un animal específico */
  getVaccinationsByAnimal(animalId: string): Promise<VaccinationRecord[]>;

  /** Alertas calculadas: animales con next_dose_date vencida o a ≤15 días */
  getVaccinationAlerts(): Promise<VaccineAlert[]>;
}

