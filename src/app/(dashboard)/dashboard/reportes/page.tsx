import Link from 'next/link'

export const metadata = {
  title: 'Reportes | Granja App'
}

export default function ReportesPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-6">Módulo de Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/reportes/insumos"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold">📊 Reporte de Insumos</h2>
          <p className="text-gray-600 mt-2">Consulta stock, consumos y tendencias</p>
        </Link>
        <Link
          href="/reportes/produccion"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold">🥛 Reporte de Producción</h2>
          <p className="text-gray-600 mt-2">Análisis de leche y huevos</p>
        </Link>
        <Link
          href="/reportes/general"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold">📈 Reporte General</h2>
          <p className="text-gray-600 mt-2">Resumen ejecutivo de toda la granja</p>
        </Link>
      </div>
    </main>
  )
}