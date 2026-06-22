import type { ApiResponse } from '@/lib/api-helpers';
import type { AnimalWithRelations, Breed, Species, UpdateAnimalDTO } from '@/types/domain/animal.schema';
import type { AnimalEvent } from '@/types/domain/health.schema';

export type UpdateAnimalResult = {
  animal: AnimalWithRelations;
  meta?: {
    changedFields?: string[];
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    updatedAt?: string;
  };
};

export type TimelineQuery = {
  category?: 'all' | 'salud' | 'vacunacion' | 'alimentacion' | 'otros';
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.ok || json.data === undefined) {
    throw new Error(json.error?.message ?? `Error ${res.status}`);
  }

  return { data: json.data, meta: json.meta };
}

export const animalService = {
  getById: (id: string) => request<AnimalWithRelations>(`/api/animales/${id}`),

  update: async (id: string, data: UpdateAnimalDTO): Promise<UpdateAnimalResult> => {
    const { data: animal, meta } = await request<AnimalWithRelations>(`/api/animales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { animal, meta };
  },

  getBreedsBySpecies: async (speciesId: string): Promise<Breed[]> => {
    const { data } = await request<Breed[]>(
      `/api/animales/breeds?speciesId=${encodeURIComponent(speciesId)}`
    );
    return data;
  },

  getTimeline: async (animalId: string, query: TimelineQuery = {}): Promise<AnimalEvent[]> => {
    const params = new URLSearchParams();
    if (query.category && query.category !== 'all') params.set('category', query.category);
    if (query.fromDate) params.set('from', query.fromDate);
    if (query.toDate) params.set('to', query.toDate);
    if (query.search) params.set('q', query.search);
    if (query.limit) params.set('limit', String(query.limit));
    if (query.offset) params.set('offset', String(query.offset));

    const qs = params.toString();
    const { data } = await request<AnimalEvent[]>(
      `/api/animales/${animalId}/historial${qs ? `?${qs}` : ''}`
    );
    return data;
  },

  getSpecies: async (): Promise<Species[]> => {
    const { data } = await request<Species[]>('/api/animales/especies');
    return data;
  },

  list: async (filters?: { speciesId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.speciesId) params.set('speciesId', filters.speciesId);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    const { data } = await request<AnimalWithRelations[]>(
      `/api/animales${qs ? `?${qs}` : ''}`
    );
    return data;
  },
};
