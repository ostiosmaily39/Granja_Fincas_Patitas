'use client'

import { useState } from 'react'
import { useReportes } from '@/hooks/useReportes'

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

  const handleGenerar = async () => {
    clearError()
    await generarReporteProduccion({
      fecha_inicio: filtros.fecha_inicio || undefined,
      fecha_fin: filtros.fecha_fin || undefined,
      tipo: filtros.tipo as any || undefined,
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
          <option value="leche">Leche</option>
          <option value="huevo">Huevos</option>
        </select>
        <button
          onClick={handleGenerar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generar Reporte
        </button>
      </div>

      {reporteProduccion && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded p-4">
              <h3 className="font-bold">🥛 Total Leche</h3>
              <p className="text-2xl font-bold text-blue-600">
                {reporteProduccion.total_produccion?.leche || 0} L
              </p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold">🥚 Total Huevos</h3>
              <p className="text-2xl font-bold text-orange-600">
                {reporteProduccion.total_produccion?.huevos || 0} und
              </p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold">📊 Promedio Diario</h3>
              <p className="text-2xl font-bold text-green-600">
                {reporteProduccion.promedio_diario?.toFixed(2) || 0}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Fecha</th>
                <th className="border p-2 text-left">Origen</th>
                <th className="border p-2 text-left">Especie</th>
                <th className="border p-2 text-left">Tipo</th>
                <th className="border p-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {reporteProduccion.produccion?.map((item: any) => (
                <tr key={item.id}>
                  <td className="border p-2">
                    {new Date(item.fecha_recoleccion).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{item.origen || 'N/A'}</td>
                  <td className="border p-2">{item.especie || 'N/A'}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${item.tipo === 'leche' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="border p-2 text-right">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}