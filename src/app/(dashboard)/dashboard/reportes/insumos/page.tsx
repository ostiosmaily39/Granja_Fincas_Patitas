import ReporteInsumos from '@/components/reportes/ReporteInsumos'

export const metadata = {
  title: 'Reporte de Insumos | Granja App'
}

export default function ReporteInsumosPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-6">Reporte de Inventario de Insumos</h1>
      <ReporteInsumos />
    </main>
  )
}