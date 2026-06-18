'use client'

import { useState } from 'react'
import { useReportes } from '@/hooks/useReportes'

export default function ReporteInsumos() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    categoria: '',
    estado: ''
  })

  const {
    loading,
    reporteInsumos,
    generarReporteInsumos,
    exportarReporte,
    error,
    clearError
  } = useReportes()

  const handleGenerar = async () => {
    clearError()
    await generarReporteInsumos({
      fecha_inicio: filtros.fecha_inicio || undefined,
      fecha_fin: filtros.fecha_fin || undefined,
      categoria: filtros.categoria as any || undefined,
      estado: filtros.estado as any || undefined
    })
  }

  const handleExportar = async (formato: 'PDF' | 'EXCEL' | 'CSV') => {
    if (!reporteInsumos) {
      alert('Primero genera el reporte')
      return
    }
    clearError()
    try {
      // Simulamos un ID de reporte generado
      const result = await exportarReporte('reporte-id-ejemplo', formato)
      console.log('Exportando:', result)
      alert(`Reporte exportado en formato ${formato}`)
    } catch (e) {
      console.error('Error al exportar:', e)
    }
  }

  if (loading) return <p className="p-4">Cargando reporte…</p>
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
          value={filtros.categoria}
          onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          <option value="alimento">Alimento</option>
          <option value="medicamento">Medicamento</option>
          <option value="otro">Otro</option>
        </select>
        <button
          onClick={handleGenerar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generar Reporte
        </button>
      </div>

      {reporteInsumos && (
        <>
          <div className="mb-2 text-sm text-gray-600">
            Total de registros: {reporteInsumos.total_registros || reporteInsumos.insumos?.length || 0}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Categoría</th>
                <th className="border p-2 text-right">Stock</th>
                <th className="border p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reporteInsumos.insumos?.map((insumo: any) => (
                <tr key={insumo.id}>
                  <td className="border p-2">{insumo.nombre}</td>
                  <td className="border p-2">{insumo.categoria}</td>
                  <td className="border p-2 text-right">{insumo.stock_actual}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${insumo.estado === 'critico' ? 'bg-red-100 text-red-700' :
                        insumo.estado === 'bajo' ? 'bg-yellow-100 text-yellow-700' :
                          insumo.estado === 'proximo_a_vencer' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                      }`}>
                      {insumo.estado?.toUpperCase() || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleExportar('PDF')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Exportar PDF
            </button>
            <button
              onClick={() => handleExportar('EXCEL')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Exportar Excel
            </button>
            <button
              onClick={() => handleExportar('CSV')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Exportar CSV
            </button>
          </div>
        </>
      )}
    </div>
  )
}