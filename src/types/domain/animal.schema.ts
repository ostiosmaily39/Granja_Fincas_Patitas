// ============================================
// ANIMAL SCHEMA - Un solo campo para nombre
// ============================================

export interface Animal {
  id: string;
  code: string;
  name: string;
  sex: 'macho' | 'hembra';
  species_id: string;
  breed_id: string | null;
  birth_date: string | null;
  acquisition_date: string | null;
  origin: string | null;
  initial_weight_kg: number | null;
  current_weight_kg: number | null;
  health_status: string;
  vaccination_status: string;
  reproductive_status: string;
  status: string;
  egress_reason: string | null;
  notes: string | null;
  mother_id: string | null;
  father_id: string | null;
  father_external: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalWithRelations extends Animal {
  species?: Species;
  breed?: Breed;
  mother?: Animal;
  father?: Animal;
}

export interface Species {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Breed {
  id: string;
  name: string;
  species_id: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateAnimalDTO {
  name?: string | null;
  current_weight_kg?: number;
  health_status?: string;
  vaccination_status?: string;
  reproductive_status?: string;
  status?: string;
  breed_id?: string | null;
  notes?: string | null;
  mother_id?: string | null;
  father_id?: string | null;
  father_external?: string | null;
}

export interface CreateAnimalDTO {
  name: string;
  sex: 'macho' | 'hembra';
  species_id: string;
  breed_id?: string | null;
  birth_date?: string | null;
  acquisition_date?: string | null;
  origin?: string | null;
  initial_weight_kg?: number | null;
  current_weight_kg?: number | null;
  health_status?: string;
  vaccination_status?: string;
  reproductive_status?: string;
  status?: string;
  notes?: string | null;
  mother_id?: string | null;
  father_id?: string | null;
  father_external?: string | null;
}