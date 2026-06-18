import ReporteProduccion from '@/components/reportes/ReporteProduccion'

export const metadata = {
  title: 'Reporte de Producción | Granja App'
}

export default function ReporteProduccionPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-6">Reporte de Producción</h1>
      <ReporteProduccion />
    </main>
  )
}