/**
 * Nombres fijos de columnas de la tabla reproductive_events.
 * Reemplaza la detección dinámica de reproductive-events-columns.ts (ELIMINADO).
 * Si alguna columna cambia en BD, solo se actualiza aquí.
 */
export const REPRO_COLS = {
    female: 'animal_id',
    father: 'father_id',
    fatherExt: 'father_external',
    eventType: 'event_type',
    status: 'gestation_status',
    estimated: 'estimated_delivery_date',
    registeredBy: 'registered_by',
    responsible: 'responsible',
} as const;

export type ReproCols = typeof REPRO_COLS;