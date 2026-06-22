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
  if (value === 'al_dia' || value === 'pendiente' || value === 'vencido') return value;
  return 'pendiente';
}

export type DbAnimalStatus = 'activo' | 'inactivo' | 'egresado';

export function toDbAnimalStatus(value: string | undefined): DbAnimalStatus {
  switch (value) {
    case 'vendido':
    case 'muerto':
    case 'descartado':
      return 'egresado';
    case 'inactivo':
      return 'inactivo';
    case 'activo':
    default:
      return 'activo';
  }
}

export function toDbEgressReason(
  uiStatus: string | undefined
): 'venta' | 'muerte' | 'traslado' | 'sacrificio' | 'otro' | null {
  switch (uiStatus) {
    case 'vendido':
      return 'venta';
    case 'muerto':
      return 'muerte';
    case 'descartado':
      return 'sacrificio';
    default:
      return null;
  }
}

/** Convierte valor BD → etiqueta UI para formularios de edición */
export function fromDbHealthStatus(value: string | undefined): string {
  switch (value) {
    case 'en_tratamiento':
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

export function fromDbAnimalStatus(
  dbStatus: string | undefined,
  egressReason?: string | null
): 'activo' | 'vendido' | 'muerto' | 'descartado' {
  if (dbStatus === 'activo' || dbStatus === 'inactivo') return 'activo';
  if (dbStatus === 'egresado') {
    switch (egressReason) {
      case 'venta':
        return 'vendido';
      case 'muerte':
        return 'muerto';
      case 'sacrificio':
        return 'descartado';
      default:
        return 'descartado';
    }
  }
  return 'activo';
}

export function fromDbReproductiveStatus(value: string | undefined): string {
  switch (value) {
    case 'en_gestion':
      return 'gestante';
    case 'en_parto':
      return 'en_parto';
    case 'sin_gestion_activa':
    default:
      return 'sin_gestion_activa';
  }
}
