import { SupabaseReporteRepository } from '@/repositories/supabase/ReporteRepository'
import type { IReporteRepository } from '@/repositories/IReporteRepository'
import type {
  FiltroReporteInsumos,
  FiltroReporteProduccion,
  FiltroReporteGeneral,
  ReportePlantilla,
  ReporteAlerta,
  ReporteGenerado
} from '@/types/domain/reporte.schema'

// 👇 Aquí swappeas la implementación el próximo trimestre
const repo: IReporteRepository = new SupabaseReporteRepository()

export const reporteService = {
  // === Generación de reportes ===
  generarReporteInsumos: (filtros: FiltroReporteInsumos) =>
    repo.generarReporteInsumos(filtros),

  generarReporteProduccion: (filtros: FiltroReporteProduccion) =>
    repo.generarReporteProduccion(filtros),

  generarReporteGeneral: (filtros: FiltroReporteGeneral) =>
    repo.generarReporteGeneral(filtros),

  // === Plantillas ===
  guardarPlantilla: (data: Omit<ReportePlantilla, 'id_plantilla' | 'fecha_creacion'>) =>
    repo.guardarPlantilla(data),

  obtenerPlantillas: (id_usuario: string) =>
    repo.obtenerPlantillas(id_usuario),

  obtenerPlantillaPorId: (id_plantilla: string) =>
    repo.obtenerPlantillaPorId(id_plantilla),

  actualizarPlantilla: (id_plantilla: string, data: Partial<ReportePlantilla>) =>
    repo.actualizarPlantilla(id_plantilla, data),

  eliminarPlantilla: (id_plantilla: string) =>
    repo.eliminarPlantilla(id_plantilla),

  // === Reportes generados (historial) ===
  guardarReporteGenerado: (data: Omit<ReporteGenerado, 'id_reporte_generado' | 'fecha_generacion'>) =>
    repo.guardarReporteGenerado(data),

  obtenerReportesGenerados: (id_usuario: string) =>
    repo.obtenerReportesGenerados(id_usuario),

  obtenerReporteGeneradoPorId: (id_reporte: string) =>
    repo.obtenerReporteGeneradoPorId(id_reporte),

  // === Alertas ===
  obtenerAlertasPendientes: (id_usuario?: string) =>
    repo.obtenerAlertasPendientes(id_usuario),

  obtenerAlertasPorTipo: (tipo: string) =>
    repo.obtenerAlertasPorTipo(tipo),

  marcarAlertaAtendida: (id_alerta: string, id_usuario: string) =>
    repo.marcarAlertaAtendida(id_alerta, id_usuario),

  generarAlerta: (data: Omit<ReporteAlerta, 'id_alerta' | 'fecha_generacion' | 'fecha_atendida' | 'estado'>) =>
    repo.generarAlerta(data),

  // === Exportación ===
  exportarReporte: (id_reporte_generado: string, formato: 'PDF' | 'EXCEL' | 'CSV') =>
    repo.exportarReporte(id_reporte_generado, formato),
}