import { useState, useCallback } from 'react'
import { reporteService } from '@/services/reporteService'
import type {
  VwReporteInsumos,
  VwReporteProduccion,
  VwReporteGeneralResumen,
  ReporteAlerta,
  ReportePlantilla
} from '@/types/domain/reporte.schema'

import type {
  FiltroReporteInsumos,
  FiltroReporteProduccion,
  FiltroReporteGeneral
} from '@/services/reporteService'

// Alias para compatibilidad con el código existente
type ReporteInsumosResponse = VwReporteInsumos[]
type ReporteProduccionResponse = VwReporteProduccion[]
type ReporteGeneralResponse = VwReporteGeneralResumen[]

export function useReportes() {
  // Estados generales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para cada tipo de reporte
  const [reporteInsumos, setReporteInsumos] = useState<ReporteInsumosResponse | null>(null)
  const [reporteProduccion, setReporteProduccion] = useState<ReporteProduccionResponse | null>(null)
  const [reporteGeneral, setReporteGeneral] = useState<ReporteGeneralResponse | null>(null)

  // Estado para alertas
  const [alertas, setAlertas] = useState<ReporteAlerta[]>([])

  // Estado para plantillas
  const [plantillas, setPlantillas] = useState<ReportePlantilla[]>([])

  // Estado para exportación
  const [exportando, setExportando] = useState(false)

  // Limpiar errores
  const clearError = () => setError(null)

  // === GENERAR REPORTE DE INSUMOS ===
  const generarReporteInsumos = useCallback(async (filtros: FiltroReporteInsumos) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.generarReporteInsumos(filtros)
      setReporteInsumos(data)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al generar reporte de insumos')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === GENERAR REPORTE DE PRODUCCIÓN ===
  const generarReporteProduccion = useCallback(async (filtros: FiltroReporteProduccion) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.generarReporteProduccion(filtros)
      setReporteProduccion(data)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al generar reporte de producción')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === GENERAR REPORTE GENERAL ===
  const generarReporteGeneral = useCallback(async (filtros: FiltroReporteGeneral) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.generarReporteGeneral(filtros)
      setReporteGeneral(data)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al generar reporte general')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === OBTENER ALERTAS ===
  const obtenerAlertas = useCallback(async (id_usuario?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.obtenerAlertasPendientes(id_usuario)
      setAlertas(data)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al obtener alertas')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === EXPORTAR REPORTE ===
  const exportarReporte = useCallback(async (id_reporte: string, formato: 'PDF' | 'EXCEL' | 'CSV') => {
    setExportando(true)
    setError(null)
    try {
      const data = await reporteService.exportarReporte(id_reporte, formato)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al exportar reporte')
      throw e
    } finally {
      setExportando(false)
    }
  }, [])

  // === MARCAR ALERTA COMO ATENDIDA ===
  const marcarAlerta = useCallback(async (id_alerta: string, id_usuario: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.marcarAlertaAtendida(id_alerta, id_usuario)
      setAlertas(prev => prev.filter(a => a.id !== id_alerta))
      return data
    } catch (e: any) {
      setError(e.message || 'Error al marcar alerta')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === OBTENER PLANTILLAS ===
  const obtenerPlantillas = useCallback(async (id_usuario: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await reporteService.obtenerPlantillas(id_usuario)
      setPlantillas(data)
      return data
    } catch (e: any) {
      setError(e.message || 'Error al obtener plantillas')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  // === GUARDAR PLANTILLA ===
  const guardarPlantilla = useCallback(async (data: Omit<ReportePlantilla, 'id_plantilla' | 'fecha_creacion'>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await reporteService.guardarPlantilla(data)
      setPlantillas(prev => [...prev, result])
      return result
    } catch (e: any) {
      setError(e.message || 'Error al guardar plantilla')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // Estados
    loading,
    error,
    exportando,
    reporteInsumos,
    reporteProduccion,
    reporteGeneral,
    alertas,
    plantillas,

    // Funciones para generar reportes
    generarReporteInsumos,
    generarReporteProduccion,
    generarReporteGeneral,

    // Funciones para alertas
    obtenerAlertas,
    marcarAlerta,

    // Funciones para plantillas
    obtenerPlantillas,
    guardarPlantilla,

    // Funciones de exportación
    exportarReporte,

    // Utilidades
    clearError
  }
}