'use client'

import { useState } from 'react'
import { useReportes } from '@/hooks/useReportes'

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

  const handleGenerar = async () => {
    clearError()
    await generarReporteGeneral({
      fecha_inicio: filtros.fecha_inicio || undefined,
      fecha_fin: filtros.fecha_fin || undefined,
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

      {reporteGeneral && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">📊 Resumen Animales</h3>
            <p>Total: {reporteGeneral.resumen_animales?.total || 0}</p>
            <div className="mt-2">
              {reporteGeneral.resumen_animales?.por_especie &&
                Object.entries(reporteGeneral.resumen_animales.por_especie).map(([especie, count]) => (
                  <p key={especie} className="text-sm">
                    • {especie}: {count}
                  </p>
                ))
              }
            </div>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">📦 Resumen Insumos</h3>
            <p>Total: {reporteGeneral.resumen_insumos?.total || 0}</p>
            <p className="text-red-600">Críticos: {reporteGeneral.resumen_insumos?.criticos || 0}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">🥛 Producción del Mes</h3>
            <p>Leche: {reporteGeneral.resumen_produccion?.leche_mes || 0} L</p>
            <p>Huevos: {reporteGeneral.resumen_produccion?.huevos_mes || 0} und</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-bold mb-2">💉 Vacunaciones</h3>
            <p className="text-yellow-600">
              Pendientes (7 días): {reporteGeneral.vacunaciones_pendientes || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}