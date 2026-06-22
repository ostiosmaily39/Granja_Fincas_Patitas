/**
 * Datos mock para todos los módulos del dashboard.
 * Los tipos se alinean con las columnas reales de Supabase.
 * Cuando se conecte la DB real, solo hay que reemplazar las importaciones.
 */

// ===================== ANIMALES =====================
export interface MockAnimal {
  id: string;
  code: string;
  name: string;
  species_id: string;
  species_name: string;
  breed: string;
  sex: 'macho' | 'hembra';
  birth_date: string;
  current_weight_kg: number;
  health_status: 'sano' | 'enfermo' | 'en_tratamiento' | 'cuarentena';
  vaccination_status: 'al_dia' | 'pendiente' | 'atrasado';
  status: 'activo' | 'vendido' | 'muerto' | 'descartado';
  encargado?: string;
  production_data?: { month: string; value: number }[];
}

export const mockAnimals: MockAnimal[] = [
  { id: '1', code: 'VAC-001', name: 'Luna', species_id: 's1', species_name: 'Vaca', breed: 'Holstein', sex: 'hembra', birth_date: '2022-03-15', current_weight_kg: 520, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo', encargado: 'Carlos Pérez', production_data: [{ month: 'Ene', value: 380 }, { month: 'Feb', value: 410 }, { month: 'Mar', value: 395 }, { month: 'Abr', value: 430 }, { month: 'May', value: 445 }, { month: 'Jun', value: 420 }] },
  { id: '2', code: 'VAC-002', name: 'Estrella', species_id: 's1', species_name: 'Vaca', breed: 'Jersey', sex: 'hembra', birth_date: '2021-07-20', current_weight_kg: 410, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo', encargado: 'Carlos Pérez', production_data: [{ month: 'Ene', value: 320 }, { month: 'Feb', value: 340 }, { month: 'Mar', value: 330 }, { month: 'Abr', value: 355 }, { month: 'May', value: 360 }, { month: 'Jun', value: 345 }] },
  { id: '3', code: 'VAC-003', name: 'Mariposa', species_id: 's1', species_name: 'Vaca', breed: 'Holstein', sex: 'hembra', birth_date: '2023-01-10', current_weight_kg: 480, health_status: 'en_tratamiento', vaccination_status: 'pendiente', status: 'activo', encargado: 'María López' },
  { id: '4', code: 'VAC-004', name: 'Toro Rey', species_id: 's1', species_name: 'Vaca', breed: 'Brahman', sex: 'macho', birth_date: '2020-11-05', current_weight_kg: 750, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo' },
  { id: '5', code: 'CER-001', name: 'Pimienta', species_id: 's2', species_name: 'Cerdo', breed: 'Landrace', sex: 'hembra', birth_date: '2023-06-12', current_weight_kg: 120, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo', encargado: 'María López' },
  { id: '6', code: 'CER-002', name: 'Trueno', species_id: 's2', species_name: 'Cerdo', breed: 'Pietrain', sex: 'macho', birth_date: '2023-04-08', current_weight_kg: 145, health_status: 'enfermo', vaccination_status: 'atrasado', status: 'activo', encargado: 'María López' },
  { id: '7', code: 'CER-003', name: 'Canela', species_id: 's2', species_name: 'Cerdo', breed: 'Duroc', sex: 'hembra', birth_date: '2024-01-22', current_weight_kg: 85, health_status: 'sano', vaccination_status: 'pendiente', status: 'activo' },
  { id: '8', code: 'GAL-001', name: 'Lote A-1', species_id: 's3', species_name: 'Gallina', breed: 'Hy-Line', sex: 'hembra', birth_date: '2024-02-10', current_weight_kg: 2.1, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo', encargado: 'Ana Gómez', production_data: [{ month: 'Ene', value: 850 }, { month: 'Feb', value: 920 }, { month: 'Mar', value: 880 }, { month: 'Abr', value: 910 }, { month: 'May', value: 940 }, { month: 'Jun', value: 900 }] },
  { id: '9', code: 'GAL-002', name: 'Lote B-1', species_id: 's3', species_name: 'Gallina', breed: 'Lohmann', sex: 'hembra', birth_date: '2024-03-05', current_weight_kg: 1.9, health_status: 'sano', vaccination_status: 'al_dia', status: 'activo', encargado: 'Ana Gómez' },
  { id: '10', code: 'VAC-005', name: 'Princesa', species_id: 's1', species_name: 'Vaca', breed: 'Angus', sex: 'hembra', birth_date: '2022-09-18', current_weight_kg: 490, health_status: 'cuarentena', vaccination_status: 'atrasado', status: 'activo' },
];

// ===================== INSUMOS =====================
export interface MockSupply {
  id: string;
  code: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  expiry_date: string;
  unit_price: number;
  supplier: string;
}

export const mockSupplies: MockSupply[] = [
  { id: '1', code: 'INS-001', name: 'Alimento Premium Mixto', category: 'Alimento', current_stock: 240, min_stock: 500, unit: 'kg', expiry_date: '2026-08-15', unit_price: 2.5, supplier: 'AgroNutri S.A.' },
  { id: '2', code: 'INS-002', name: 'Vacuna Lote B-12', category: 'Medicamento', current_stock: 15, min_stock: 50, unit: 'dosis', expiry_date: '2026-05-20', unit_price: 12.0, supplier: 'VetPharma' },
  { id: '3', code: 'INS-003', name: 'Silo Orgánico', category: 'Alimento', current_stock: 1200, min_stock: 800, unit: 'kg', expiry_date: '2026-12-01', unit_price: 1.8, supplier: 'ForrajeSur' },
  { id: '4', code: 'INS-004', name: 'Antibiótico Oxitetraciclina', category: 'Medicamento', current_stock: 30, min_stock: 20, unit: 'dosis', expiry_date: '2026-04-25', unit_price: 8.5, supplier: 'VetPharma' },
  { id: '5', code: 'INS-005', name: 'Concentrado Aves Postura', category: 'Alimento', current_stock: 600, min_stock: 400, unit: 'kg', expiry_date: '2026-09-10', unit_price: 3.2, supplier: 'AgroNutri S.A.' },
  { id: '6', code: 'INS-006', name: 'Desparasitante Ivermectina', category: 'Medicamento', current_stock: 8, min_stock: 25, unit: 'dosis', expiry_date: '2026-06-30', unit_price: 15.0, supplier: 'BioVet Labs' },
  { id: '7', code: 'INS-007', name: 'Sal Mineralizada', category: 'Suplemento', current_stock: 90, min_stock: 50, unit: 'kg', expiry_date: '2027-03-15', unit_price: 4.0, supplier: 'MinAgro' },
  { id: '8', code: 'INS-008', name: 'Vitaminas ADE', category: 'Suplemento', current_stock: 12, min_stock: 30, unit: 'frascos', expiry_date: '2026-07-20', unit_price: 22.0, supplier: 'BioVet Labs' },
];

// ===================== PRODUCCIÓN =====================
export interface MockProduction {
  month: string;
  milk_liters: number;
  egg_units: number;
}

export const mockProduction: MockProduction[] = [
  { month: 'Ene', milk_liters: 12400, egg_units: 25200 },
  { month: 'Feb', milk_liters: 11800, egg_units: 23500 },
  { month: 'Mar', milk_liters: 13200, egg_units: 26800 },
  { month: 'Abr', milk_liters: 12900, egg_units: 27100 },
  { month: 'May', milk_liters: 14100, egg_units: 28500 },
  { month: 'Jun', milk_liters: 13500, egg_units: 27800 },
  { month: 'Jul', milk_liters: 13800, egg_units: 26900 },
  { month: 'Ago', milk_liters: 14500, egg_units: 29200 },
  { month: 'Sep', milk_liters: 13900, egg_units: 28000 },
  { month: 'Oct', milk_liters: 14200, egg_units: 27500 },
  { month: 'Nov', milk_liters: 13600, egg_units: 26200 },
  { month: 'Dic', milk_liters: 12800, egg_units: 24800 },
];

// ===================== REPRODUCCIÓN =====================
export interface MockReproduction {
  id: string;
  cross_name: string;
  female_name: string;
  male_name: string;
  breed: string;
  event_date: string;
  event_type: string;
  gestation_status: 'en_seguimiento' | 'confirmada' | 'fallida' | 'parto_exitoso';
  effective: boolean;
}

export const mockReproductions: MockReproduction[] = [
  { id: '1', cross_name: 'Luna × Toro Rey', female_name: 'Luna', male_name: 'Toro Rey', breed: 'Holstein-Brahman', event_date: '2026-03-01', event_type: 'monta_natural', gestation_status: 'confirmada', effective: true },
  { id: '2', cross_name: 'Estrella × Semen AI-04', female_name: 'Estrella', male_name: 'Semen AI-04', breed: 'Jersey', event_date: '2026-03-10', event_type: 'inseminacion', gestation_status: 'parto_exitoso', effective: true },
  { id: '3', cross_name: 'Mariposa × Toro Rey', female_name: 'Mariposa', male_name: 'Toro Rey', breed: 'Holstein-Brahman', event_date: '2026-02-15', event_type: 'monta_natural', gestation_status: 'fallida', effective: false },
  { id: '4', cross_name: 'Pimienta × CER-M01', female_name: 'Pimienta', male_name: 'CER-M01', breed: 'Landrace', event_date: '2026-03-20', event_type: 'monta_natural', gestation_status: 'en_seguimiento', effective: true },
  { id: '5', cross_name: 'Princesa × Semen AI-07', female_name: 'Princesa', male_name: 'Semen AI-07', breed: 'Angus', event_date: '2026-01-28', event_type: 'inseminacion', gestation_status: 'parto_exitoso', effective: true },
];

// ===================== PERSONAL =====================
export interface MockPersonal {
  id: string;
  name: string;
  phone: string;
  role: 'ENCARGADO' | 'EMPLEADO';
  is_active: boolean;
  animals_assigned: number;
  tasks_pending: number;
}

export const mockPersonal: MockPersonal[] = [
  { id: '1', name: 'Carlos Pérez', phone: '310-555-1234', role: 'ENCARGADO', is_active: true, animals_assigned: 4, tasks_pending: 2 },
  { id: '2', name: 'María López', phone: '311-555-5678', role: 'ENCARGADO', is_active: true, animals_assigned: 3, tasks_pending: 1 },
  { id: '3', name: 'Ana Gómez', phone: '312-555-9012', role: 'EMPLEADO', is_active: true, animals_assigned: 2, tasks_pending: 5 },
  { id: '4', name: 'Pedro Ramírez', phone: '313-555-3456', role: 'EMPLEADO', is_active: true, animals_assigned: 0, tasks_pending: 3 },
  { id: '5', name: 'Lucía Torres', phone: '314-555-7890', role: 'EMPLEADO', is_active: false, animals_assigned: 0, tasks_pending: 0 },
];

// ===================== ALERTAS =====================
export interface MockAlert {
  id: string;
  type: 'stock' | 'vencimiento' | 'salud' | 'vacunacion';
  level: 'baja' | 'media' | 'critica';
  title: string;
  detail: string;
  entity_name: string;
  created_at: string;
}

export const mockAlerts: MockAlert[] = [
  { id: '1', type: 'stock', level: 'critica', title: 'Stock Crítico', detail: '240kg restantes de 500kg mínimo', entity_name: 'Alimento Premium Mixto', created_at: '2026-04-09' },
  { id: '2', type: 'stock', level: 'critica', title: 'Stock Crítico', detail: '8 dosis restantes de 25 mínimo', entity_name: 'Desparasitante Ivermectina', created_at: '2026-04-09' },
  { id: '3', type: 'vencimiento', level: 'critica', title: 'Próximo a Vencer', detail: 'Vence el 25/04/2026 (16 días)', entity_name: 'Antibiótico Oxitetraciclina', created_at: '2026-04-09' },
  { id: '4', type: 'stock', level: 'media', title: 'Stock Bajo', detail: '15 dosis restantes de 50 mínimo', entity_name: 'Vacuna Lote B-12', created_at: '2026-04-08' },
  { id: '5', type: 'stock', level: 'media', title: 'Stock Bajo', detail: '12 frascos restantes de 30 mínimo', entity_name: 'Vitaminas ADE', created_at: '2026-04-08' },
  { id: '6', type: 'vencimiento', level: 'baja', title: 'Vencimiento Próximo', detail: 'Vence el 20/05/2026 (41 días)', entity_name: 'Vacuna Lote B-12', created_at: '2026-04-07' },
  { id: '7', type: 'vacunacion', level: 'media', title: 'Vacunación Atrasada', detail: '2 animales con vacunas atrasadas', entity_name: 'Sector Bovino', created_at: '2026-04-07' },
];

// ===================== ACTIVIDAD RECIENTE =====================
export interface MockActivity {
  id: string;
  title: string;
  description: string;
  category: 'animales' | 'rutina' | 'bodega';
  user_name: string;
  timestamp: string;
  sector: string;
}

export const mockActivities: MockActivity[] = [
  { id: '1', title: 'Nuevo Nacimiento Registrado', description: 'Vaca Luna parió un ternero macho saludable. ID: VAC-012.', category: 'animales', user_name: 'Carlos Pérez', timestamp: 'Hace 2 horas', sector: 'Sector B' },
  { id: '2', title: 'Vacunación Completada', description: 'Ronda de vacunación completada para 45 gallinas en Galpón 4.', category: 'rutina', user_name: 'Ana Gómez', timestamp: 'Hace 5 horas', sector: 'Unidad Aviar' },
  { id: '3', title: 'Entrega de Inventario', description: 'Llegada confirmada de 500kg de Silo Orgánico. Niveles restaurados.', category: 'bodega', user_name: 'Pedro Ramírez', timestamp: 'Ayer', sector: 'Bodega Principal' },
  { id: '4', title: 'Tratamiento Médico', description: 'Cerdo Trueno recibió antibiótico para infección respiratoria.', category: 'animales', user_name: 'María López', timestamp: 'Ayer', sector: 'Sector Porcino' },
  { id: '5', title: 'Alimentación General', description: 'Rutina de alimentación matutina completada para todo el ganado.', category: 'rutina', user_name: 'Ana Gómez', timestamp: 'Hace 2 días', sector: 'General' },
  { id: '6', title: 'Movimiento de Stock', description: 'Salida de 50kg de Concentrado Aves Postura a Galpón 3.', category: 'bodega', user_name: 'Pedro Ramírez', timestamp: 'Hace 2 días', sector: 'Bodega Principal' },
];

// ===================== TAREAS (Empleado) =====================
export interface MockTask {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: 'completada' | 'incompleta' | 'pendiente';
  due_date: string;
  category: 'general' | 'individual';
}

export const mockTasks: MockTask[] = [
  { id: '1', title: 'Alimentar ganado bovino', description: 'Distribuir ración matutina a todas las vacas del Sector A y B', assigned_to: 'Ana Gómez', status: 'completada', due_date: '2026-04-09', category: 'general' },
  { id: '2', title: 'Revisión de cercas Sector B', description: 'Inspeccionar y reparar cercas del perímetro norte', assigned_to: 'Ana Gómez', status: 'incompleta', due_date: '2026-04-09', category: 'individual' },
  { id: '3', title: 'Recolección de huevos', description: 'Recolectar huevos de Galpón 3 y 4, registrar cantidades', assigned_to: 'Ana Gómez', status: 'pendiente', due_date: '2026-04-09', category: 'general' },
  { id: '4', title: 'Limpieza de bebederos', description: 'Limpiar y desinfectar todos los bebederos del Sector Porcino', assigned_to: 'Ana Gómez', status: 'pendiente', due_date: '2026-04-09', category: 'general' },
  { id: '5', title: 'Aplicar tratamiento a Trueno', description: 'Administrar dosis de Oxitetraciclina al cerdo Trueno (CER-002)', assigned_to: 'Ana Gómez', status: 'incompleta', due_date: '2026-04-09', category: 'individual' },
  { id: '6', title: 'Registrar peso de terneros', description: 'Pesar y registrar terneros nacidos este mes', assigned_to: 'Ana Gómez', status: 'completada', due_date: '2026-04-08', category: 'individual' },
];

// ===================== ALIMENTACIÓN (Empleado) =====================
export interface MockFeeding {
  id: string;
  animal_code: string;
  animal_name: string;
  species: string;
  fed: boolean;
  fed_at?: string;
}

export const mockFeedings: MockFeeding[] = [
  { id: '1', animal_code: 'VAC-001', animal_name: 'Luna', species: 'Vaca', fed: true, fed_at: '06:30' },
  { id: '2', animal_code: 'VAC-002', animal_name: 'Estrella', species: 'Vaca', fed: true, fed_at: '06:35' },
  { id: '3', animal_code: 'VAC-003', animal_name: 'Mariposa', species: 'Vaca', fed: false },
  { id: '4', animal_code: 'VAC-004', animal_name: 'Toro Rey', species: 'Vaca', fed: true, fed_at: '06:40' },
  { id: '5', animal_code: 'CER-001', animal_name: 'Pimienta', species: 'Cerdo', fed: true, fed_at: '07:00' },
  { id: '6', animal_code: 'CER-002', animal_name: 'Trueno', species: 'Cerdo', fed: false },
  { id: '7', animal_code: 'CER-003', animal_name: 'Canela', species: 'Cerdo', fed: false },
  { id: '8', animal_code: 'GAL-001', animal_name: 'Lote A-1', species: 'Gallina', fed: true, fed_at: '06:15' },
  { id: '9', animal_code: 'GAL-002', animal_name: 'Lote B-1', species: 'Gallina', fed: false },
];

// ===================== SALUD ANIMAL (Empleado) =====================
export interface MockVaccinationStatus {
  id: string;
  animal_code: string;
  animal_name: string;
  species: string;
  vaccines_applied: number;
  vaccines_pending: number;
  pending_list: string[];
  urgency: 'ninguna' | 'normal' | 'inmediata';
}

export const mockVaccinationStatus: MockVaccinationStatus[] = [
  { id: '1', animal_code: 'VAC-001', animal_name: 'Luna', species: 'Vaca', vaccines_applied: 5, vaccines_pending: 0, pending_list: [], urgency: 'ninguna' },
  { id: '2', animal_code: 'VAC-003', animal_name: 'Mariposa', species: 'Vaca', vaccines_applied: 3, vaccines_pending: 2, pending_list: ['Brucella', 'Aftosa'], urgency: 'normal' },
  { id: '3', animal_code: 'VAC-005', animal_name: 'Princesa', species: 'Vaca', vaccines_applied: 2, vaccines_pending: 3, pending_list: ['Brucella', 'Aftosa', 'Carbón'], urgency: 'inmediata' },
  { id: '4', animal_code: 'CER-002', animal_name: 'Trueno', species: 'Cerdo', vaccines_applied: 1, vaccines_pending: 2, pending_list: ['Peste Porcina', 'Mycoplasma'], urgency: 'inmediata' },
  { id: '5', animal_code: 'CER-003', animal_name: 'Canela', species: 'Cerdo', vaccines_applied: 2, vaccines_pending: 1, pending_list: ['Mycoplasma'], urgency: 'normal' },
  { id: '6', animal_code: 'GAL-001', animal_name: 'Lote A-1', species: 'Gallina', vaccines_applied: 4, vaccines_pending: 0, pending_list: [], urgency: 'ninguna' },
];
