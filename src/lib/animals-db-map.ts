/**
 * Mapeo dominio (UI / Zod) → enums y valores de la base GRANJA_DB_COMPLETO_CORREGIDO.sql
 */
export type DbHealthStatus = 'sano' | 'en_tratamiento' | 'cronico' | 'fallecido';

export function toDbHealthStatus(value: string | undefined): DbHealthStatus {
  switch (value) {
    case 'en_tratamiento':
    case 'enfermo':
    case 'cuarentena':
      return 'en_tratamiento';
    case 'cronico':
      return 'cronico';
    case 'fallecido':
      return 'fallecido';
    case 'sano':
    default:
      return 'sano';
  }
}

export type DbReproductiveStatus = 'sin_gestion_activa' | 'en_gestion' | 'en_parto';

export function toDbReproductiveStatus(
  value: string | undefined,
  sex: 'macho' | 'hembra'
): DbReproductiveStatus {
  if (sex === 'macho') return 'sin_gestion_activa';
  switch (value) {
    case 'apto':
    case 'gestante':
    case 'lactante':
      return 'en_gestion';
    case 'en_parto':
      return 'en_parto';
    case 'descanso':
    case 'no_aplica':
    default:
      return 'sin_gestion_activa';
  }
}

export type DbAnimalOrigin = 'nacido_en_finca' | 'adquirido_externo';

export function toDbVaccinationStatus(
  value: string | undefined
): 'al_dia' | 'pendiente' | 'vencido' {
  if (value === 'al_dia' || value === 'pendiente') return value;
  return 'pendiente';
}
