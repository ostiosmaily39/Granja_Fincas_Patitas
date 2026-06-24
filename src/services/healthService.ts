import type { ApiResponse } from '@/lib/api-helpers';
import type {
  CreateHealthEventInput,
  CreateVaccinationInput,
  CreateVaccineSchemeInput,
  HealthEvent,
  VaccinationRecord,
  VaccineAlert,
  VaccineScheme,
} from '@/types/domain/health.schema';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.ok) {
    throw new Error(json.error?.message ?? `Error ${res.status}`);
  }

  if (json.data === undefined && res.status !== 204) {
    throw new Error(json.error?.message ?? `Error ${res.status}`);
  }

  return json.data as T;
}

export type SupplyOption = {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
};

export const healthService = {
  registerEvent: (animalId: string, input: CreateHealthEventInput): Promise<HealthEvent> =>
    request<HealthEvent>(`/api/animales/${animalId}/salud`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getVaccineSchemes: (speciesId?: string): Promise<VaccineScheme[]> => {
    const qs = speciesId ? `?speciesId=${encodeURIComponent(speciesId)}` : '';
    return request<VaccineScheme[]>(`/api/vacunacion/esquemas${qs}`);
  },

  createVaccineScheme: (input: CreateVaccineSchemeInput): Promise<VaccineScheme> =>
    request<VaccineScheme>('/api/vacunacion/esquemas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateVaccineScheme: (
    id: string,
    input: Partial<CreateVaccineSchemeInput>
  ): Promise<VaccineScheme> =>
    request<VaccineScheme>(`/api/vacunacion/esquemas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteVaccineScheme: (id: string): Promise<void> =>
    request<{ deleted: boolean }>(`/api/vacunacion/esquemas/${id}`, {
      method: 'DELETE',
    }).then(() => undefined),

  getVaccinationAlerts: (): Promise<VaccineAlert[]> =>
    request<VaccineAlert[]>('/api/vacunacion/alertas'),

  registerVaccination: (
    animalId: string,
    input: CreateVaccinationInput
  ): Promise<VaccinationRecord> =>
    request<VaccinationRecord>(`/api/animales/${animalId}/vacunacion`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getVaccinationsByAnimal: (animalId: string): Promise<VaccinationRecord[]> =>
    request<VaccinationRecord[]>(`/api/animales/${animalId}/vacunacion`),

  getAvailableSupplies: (): Promise<SupplyOption[]> =>
    request<SupplyOption[]>('/api/insumos/disponibles'),
};
