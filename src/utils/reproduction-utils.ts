import { addDays, subDays, differenceInDays, isAfter, isBefore } from 'date-fns';

export interface ReproMilestone {
  id: string;
  label: string;
  date: Date;
  status: 'pending' | 'active' | 'completed' | 'overdue';
  description: string;
}

/**
 * Calcula los hitos reproductivos basados en la fecha de servicio y los días de gestación de la especie.
 */
export function calculateReproMilestones(
  serviceDate: Date | string,
  gestationDays: number | null,
  isMilkProductive: boolean = false
): ReproMilestone[] {
  const start = new Date(serviceDate);
  const now = new Date();
  const milestones: ReproMilestone[] = [];

  // Si no hay días de gestación definidos, no podemos calcular nada exacto
  if (!gestationDays) return [];

  // 1. Ecografía / Confirmación (30 - 60 días tras el servicio)
  const ultrasoundMin = addDays(start, 30);
  const ultrasoundMax = addDays(start, 60);
  milestones.push({
    id: 'ultrasound',
    label: 'Ecografía / Confirmación',
    date: ultrasoundMax,
    description: 'Ventana para confirmar preñez (aprox. 30-60 días).',
    status: getMilestoneStatus(ultrasoundMin, ultrasoundMax, now)
  });

  // 2. Secado (60 días ANTES del parto) - Solo si aplica
  const deliveryDate = addDays(start, gestationDays);
  if (isMilkProductive) {
    const dryingDate = subDays(deliveryDate, 60);
    milestones.push({
      id: 'drying',
      label: 'Fecha de Secado',
      date: dryingDate,
      description: 'Suspender ordeño para preparar el parto (60 días antes).',
      status: getMilestoneStatus(subDays(dryingDate, 7), dryingDate, now)
    });
  }

  // 3. Parto Probable
  milestones.push({
    id: 'delivery',
    label: 'Fecha Probable de Parto',
    date: deliveryDate,
    description: `Estimación basada en ${gestationDays} días de gestación.`,
    status: getMilestoneStatus(subDays(deliveryDate, 10), deliveryDate, now)
  });

  return milestones;
}

function getMilestoneStatus(minDate: Date, maxDate: Date, now: Date): 'pending' | 'active' | 'completed' | 'overdue' {
  if (isBefore(now, minDate)) return 'pending';
  if (isAfter(now, maxDate)) return 'overdue';
  return 'active';
}

/**
 * Calcula el porcentaje de progreso de la gestación.
 */
export function getGestationProgress(serviceDate: Date | string, gestationDays: number): number {
  const start = new Date(serviceDate);
  const now = new Date();
  const totalDays = gestationDays;
  const daysPassed = differenceInDays(now, start);

  if (daysPassed < 0) return 0;
  if (daysPassed >= totalDays) return 100;
  
  return Math.round((daysPassed / totalDays) * 100);
}
