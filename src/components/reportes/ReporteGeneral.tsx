'use client'

import { useState, useMemo } from 'react'
import { useReportes } from '@/hooks/useReportes'
import type { VwReporteGeneralResumen } from '@/types/domain/reporte.schema'

export default function ReporteGeneral() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
  })

  const {
    loading,
    reporteGeneral,
    generarReporteGeneral,
    error,
    clearError
  } = useReportes()

  // Agrupar datos por sección para facilitar la visualización
  const datosAgrupados = useMemo(() => {
    if (!reporteGeneral || !Array.isArray(reporteGeneral)) {
      return {
        animales: [],
        insumos: [],
        produccion: [],
        otros: []
      }
    }

    const grouped: Record<string, VwReporteGeneralResumen[]> = {
      animales: [],
      insumos: [],
      produccion: [],
      otros: []
    }

    reporteGeneral.forEach(item => {
      const seccion = item.seccion.toLowerCase()
      if (seccion.includes('animal') || seccion.includes('ganado')) {
        grouped.animales.push(item)
      } else if (seccion.includes('insumo') || seccion.includes('stock')) {
        grouped.insumos.push(item)
      } else if (seccion.includes('produc') || seccion.includes('leche') || seccion.includes('huevo')) {
        grouped.produccion.push(item)
      } else {
        grouped.otros.push(item)
      }
    })

    return grouped
  }, [reporteGeneral])

  // Calcular totales
  const totales = useMemo(() => {
    const getTotal = (items: VwReporteGeneralResumen[]) =>
      items.reduce((sum, item) => sum + (item.total || 0), 0)

    return {
      animales: getTotal(datosAgrupados.animales),
      insumos: getTotal(datosAgrupados.insumos),
      produccion: getTotal(datosAgrupados.produccion),
    }
  }, [datosAgrupados])

  const handleGenerar = async () => {
    clearError()
    await generarReporteGeneral({
      fechaInicio: filtros.fecha_inicio || undefined,
      fechaFin: filtros.fecha_fin || undefined,
    })
  }

  if (loading) return <p className="p-4">Cargando reporte general…</p>
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={filtros.fecha_inicio}
          onChange={e => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
          className="border p-2 rounded"
          placeholder="Fecha inicio"
        />
        <input
          type="date"
          value={filtros.fecha_fin}
          onChange={e => setFiltros({ ...filtros, fecha_fin: e.target.value })}
          className="border p-2 rounded"
          placeholder="Fecha fin"
        />
        <button
          onClick={handleGenerar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generar Reporte General
        </button>
      </div>

      {reporteGeneral && Array.isArray(reporteGeneral) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resumen Animales */}
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">📊 Resumen Animales</h3>
            <p className="text-2xl font-black text-gray-900">
              Total: {totales.animales}
            </p>
            <div className="mt-2 space-y-1">
              {datosAgrupados.animales.length > 0 ? (
                datosAgrupados.animales.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    • {item.detalle || item.seccion}: <span className="font-bold">{item.cantidad}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Sin datos de animales</p>
              )}
            </div>
          </div>

          {/* Resumen Insumos */}
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">📦 Resumen Insumos</h3>
            <p className="text-2xl font-black text-gray-900">
              Total: {totales.insumos}
            </p>
            <div className="mt-2 space-y-1">
              {datosAgrupados.insumos.length > 0 ? (
                datosAgrupados.insumos.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    • {item.detalle || item.seccion}: <span className="font-bold">{item.cantidad}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Sin datos de insumos</p>
              )}
            </div>
          </div>

          {/* Producción del Mes */}
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">🥛 Producción del Mes</h3>
            <p className="text-2xl font-black text-gray-900">
              Total: {totales.produccion}
            </p>
            <div className="mt-2 space-y-1">
              {datosAgrupados.produccion.length > 0 ? (
                datosAgrupados.produccion.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    • {item.detalle || item.seccion}: <span className="font-bold">{item.cantidad}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Sin datos de producción</p>
              )}
            </div>
          </div>

          {/* Otros */}
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">💉 Otros Datos</h3>
            <div className="mt-2 space-y-1">
              {datosAgrupados.otros.length > 0 ? (
                datosAgrupados.otros.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    • {item.seccion}: <span className="font-bold">{item.cantidad}</span>
                    {item.detalle && <span className="text-gray-500"> ({item.detalle})</span>}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Sin datos adicionales</p>
              )}
            </div>
          </div>
        </div>
      )}

      {reporteGeneral && Array.isArray(reporteGeneral) && reporteGeneral.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg font-bold">No hay datos para el período seleccionado</p>
          <p className="text-sm">Intenta con otras fechas o genera el reporte nuevamente</p>
        </div>
      )}
    </div>
  )
}