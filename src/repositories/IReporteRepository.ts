import type { 
  ReportePlantilla, 
  CreateReportePlantilla, 
  ReporteGenerado, 
  ReporteAlerta, 
  VwReporteInsumos, 
  VwReporteProduccion, 
  VwReporteGeneralResumen,
  TipoReporte,
  EstadoAlerta
} from '@/types/domain/reporte.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export interface IReporteRepository {
  // --- Plantillas ---
  getPlantillas(tipo?: TipoReporte, supabaseClient?: SupabaseClient): Promise<ReportePlantilla[]>;
  getPlantillaById(id: string, supabaseClient?: SupabaseClient): Promise<ReportePlantilla | null>;
  createPlantilla(plantilla: CreateReportePlantilla, supabaseClient?: SupabaseClient): Promise<ReportePlantilla>;
  updatePlantilla(id: string, plantilla: Partial<CreateReportePlantilla>, supabaseClient?: SupabaseClient): Promise<ReportePlantilla>;
  deletePlantilla(id: string, supabaseClient?: SupabaseClient): Promise<void>;

  // --- Reportes Generados ---
  getReportesGenerados(tipo?: TipoReporte, supabaseClient?: SupabaseClient): Promise<ReporteGenerado[]>;
  createReporteGenerado(
    reporte: Omit<ReporteGenerado, 'id' | 'fecha_generacion'>, 
    supabaseClient?: SupabaseClient
  ): Promise<ReporteGenerado>;
  deleteReporteGenerado(id: string, supabaseClient?: SupabaseClient): Promise<void>;

  // --- Alertas ---
  getAlertas(estado?: EstadoAlerta, supabaseClient?: SupabaseClient): Promise<ReporteAlerta[]>;
  atenderAlerta(
    id: string, 
    usuarioId: string, 
    estado: EstadoAlerta, 
    supabaseClient?: SupabaseClient
  ): Promise<void>;
  generarAlertasAutomaticas(supabaseClient?: SupabaseClient): Promise<void>;

  // --- Consultas a Vistas / Procedimientos ---
  obtenerReporteInsumos(
    filtros: { 
      fechaInicio?: string; 
      fechaFin?: string; 
      categoria?: string; 
      estado?: string; 
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteInsumos[]>;

  obtenerReporteProduccion(
    filtros: { 
      fechaInicio?: string; 
      fechaFin?: string; 
      tipo?: string; 
      idAnimal?: string; 
      idLote?: string; 
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteProduccion[]>;

  obtenerReporteGeneral(
    filtros: { 
      fechaInicio?: string; 
      fechaFin?: string; 
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteGeneralResumen[]>;
}
