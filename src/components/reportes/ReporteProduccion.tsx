'use client'

import { useState, useMemo } from 'react'
import { useReportes } from '@/hooks/useReportes'
import type { VwReporteProduccion } from '@/types/domain/reporte.schema'

export default function ReporteProduccion() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo: '',
    id_animal: ''
  })

  const {
    loading,
    reporteProduccion,
    generarReporteProduccion,
    error,
    clearError
  } = useReportes()

  // Calcular totales y promedios
  const estadisticas = useMemo(() => {
    if (!reporteProduccion || !Array.isArray(reporteProduccion)) {
      return {
        totalLeche: 0,
        totalHuevos: 0,
        promedioDiario: 0,
        diasUnicos: 0
      }
    }

    const totalLeche = reporteProduccion
      .filter(item => item.tipo === 'LECHE')
      .reduce((sum, item) => sum + (item.cantidad || 0), 0)

    const totalHuevos = reporteProduccion
      .filter(item => item.tipo === 'HUEVO')
      .reduce((sum, item) => sum + (item.cantidad || 0), 0)

    // Calcular días únicos para el promedio
    const diasUnicos = new Set(
      reporteProduccion.map(item => item.fecha_recoleccion)
    ).size

    const totalGeneral = totalLeche + totalHuevos
    const promedioDiario = diasUnicos > 0 ? totalGeneral / diasUnicos : 0

    return {
      totalLeche,
      totalHuevos,
      promedioDiario,
      diasUnicos
    }
  }, [reporteProduccion])

  const handleGenerar = async () => {
    clearError()
    await generarReporteProduccion({
      fecha_inicio: filtros.fecha_inicio || undefined,
      fecha_fin: filtros.fecha_fin || undefined,
      tipo: filtros.tipo || undefined,
      id_animal: filtros.id_animal || undefined
    })
  }

  if (loading) return <p className="p-4">Cargando reporte de producción…</p>
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>

  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <select
          value={filtros.tipo}
          onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Todos los tipos</option>
          <option value="LECHE">Leche</option>
          <option value="HUEVO">Huevos</option>
        </select>
        <button
          onClick={handleGenerar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generar Reporte
        </button>
      </div>

      {reporteProduccion && Array.isArray(reporteProduccion) && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded p-4">
              <h3 className="font-bold">🥛 Total Leche</h3>
              <p className="text-2xl font-bold text-blue-600">
                {estadisticas.totalLeche.toLocaleString()} L
              </p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold">🥚 Total Huevos</h3>
              <p className="text-2xl font-bold text-orange-600">
                {estadisticas.totalHuevos.toLocaleString()} und
              </p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold">📊 Promedio Diario</h3>
              <p className="text-2xl font-bold text-green-600">
                {estadisticas.promedioDiario.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Basado en {estadisticas.diasUnicos} días
              </p>
            </div>
          </div>

          {/* Total de registros */}
          <div className="mb-2 text-sm text-gray-600">
            Total de registros: {reporteProduccion.length}
          </div>

          {/* Tabla de producción */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Fecha</th>
                <th className="border p-2 text-left">Origen</th>
                <th className="border p-2 text-left">Especie</th>
                <th className="border p-2 text-left">Tipo</th>
                <th className="border p-2 text-right">Cantidad</th>
                <th className="border p-2 text-left">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {reporteProduccion.map((item: VwReporteProduccion) => (
                <tr key={item.id_produccion || `${item.fecha_recoleccion}-${item.id_animal}`}>
                  <td className="border p-2">
                    {new Date(item.fecha_recoleccion).toLocaleDateString('es-CO')}
                  </td>
                  <td className="border p-2">{item.origen || 'N/A'}</td>
                  <td className="border p-2">{item.especie || 'N/A'}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${item.tipo === 'LECHE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="border p-2 text-right font-bold">
                    {item.cantidad.toLocaleString()}
                  </td>
                  <td className="border p-2">{item.unidad_medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {reporteProduccion && Array.isArray(reporteProduccion) && reporteProduccion.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg font-bold">No hay datos de producción para los filtros seleccionados</p>
          <p className="text-sm">Intenta con otras fechas o tipos de producto</p>
        </div>
      )}
    </div>
  )
}