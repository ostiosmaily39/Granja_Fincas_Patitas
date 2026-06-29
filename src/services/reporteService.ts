import { ReporteRepository } from '@/repositories/supabase/ReporteRepository'
import type { IReporteRepository } from '@/repositories/IReporteRepository'
import type {
  VwReporteInsumos,
  VwReporteProduccion,
  VwReporteGeneralResumen,
  ReportePlantilla,
  CreateReportePlantilla,
  ReporteGenerado,
  ReporteAlerta,
  TipoReporte,
  EstadoAlerta
} from '@/types/domain/reporte.schema'

// Tipos de filtros (definidos localmente)
export interface FiltroReporteInsumos {
  fechaInicio?: string
  fechaFin?: string
  categoria?: string
  estado?: string
}

export interface FiltroReporteProduccion {
  fechaInicio?: string
  fechaFin?: string
  tipo?: string
  idAnimal?: string
  idLote?: string
}

export interface FiltroReporteGeneral {
  fechaInicio?: string
  fechaFin?: string
}

// Instancia del repositorio
const repo: IReporteRepository = new ReporteRepository()

export const reporteService = {
  // === Generación de reportes (usando métodos de la interfaz) ===
  generarReporteInsumos: (filtros: FiltroReporteInsumos): Promise<VwReporteInsumos[]> =>
    repo.obtenerReporteInsumos({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      categoria: filtros.categoria,
      estado: filtros.estado
    }),

  generarReporteProduccion: (filtros: FiltroReporteProduccion): Promise<VwReporteProduccion[]> =>
    repo.obtenerReporteProduccion({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      tipo: filtros.tipo,
      idAnimal: filtros.idAnimal,
      idLote: filtros.idLote
    }),

  generarReporteGeneral: (filtros: FiltroReporteGeneral): Promise<VwReporteGeneralResumen[]> =>
    repo.obtenerReporteGeneral({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin
    }),

  // === Plantillas ===
  guardarPlantilla: (data: Omit<ReportePlantilla, 'id' | 'fecha_creacion' | 'fecha_modificacion'>): Promise<ReportePlantilla> =>
    repo.createPlantilla(data as CreateReportePlantilla),

  obtenerPlantillas: (tipo?: TipoReporte): Promise<ReportePlantilla[]> =>
    repo.getPlantillas(tipo),

  obtenerPlantillaPorId: (id: string): Promise<ReportePlantilla | null> =>
    repo.getPlantillaById(id),

  actualizarPlantilla: (id: string, data: Partial<CreateReportePlantilla>): Promise<ReportePlantilla> =>
    repo.updatePlantilla(id, data),

  eliminarPlantilla: (id: string): Promise<void> =>
    repo.deletePlantilla(id),

  // === Reportes generados (historial) ===
  guardarReporteGenerado: (data: Omit<ReporteGenerado, 'id' | 'fecha_generacion'>): Promise<ReporteGenerado> =>
    repo.createReporteGenerado(data),

  obtenerReportesGenerados: (tipo?: TipoReporte): Promise<ReporteGenerado[]> =>
    repo.getReportesGenerados(tipo),

  obtenerReporteGeneradoPorId: async (_id_reporte: string): Promise<ReporteGenerado | null> => {
    // TODO: Implementar en el repositorio
    console.warn('obtenerReporteGeneradoPorId no está implementado aún')
    return null
  },

  // === Alertas ===
  obtenerAlertasPendientes: async (_id_usuario?: string): Promise<ReporteAlerta[]> => {
    // Usar getAlertas filtrando por estado pendiente
    const alertas = await repo.getAlertas('pendiente')
    return alertas
  },

  obtenerAlertasPorTipo: async (_tipo: string): Promise<ReporteAlerta[]> => {
    // TODO: Implementar en el repositorio
    console.warn('obtenerAlertasPorTipo no está implementado aún')
    return []
  },

  marcarAlertaAtendida: async (id_alerta: string, id_usuario: string): Promise<void> => {
    await repo.atenderAlerta(id_alerta, id_usuario, 'atendida')
  },

  generarAlerta: async (_data: Omit<ReporteAlerta, 'id' | 'fecha_generacion' | 'fecha_atendida'>): Promise<void> => {
    // TODO: Implementar en el repositorio
    console.warn('generarAlerta no está implementado aún')
  },

  // === Exportación ===
  exportarReporte: async (_id_reporte_generado: string, _formato: 'PDF' | 'EXCEL' | 'CSV'): Promise<Blob | null> => {
    // TODO: Implementar en el repositorio
    console.warn('exportarReporte no está implementado aún')
    return null
  },
}