import ReporteGeneral from '@/components/reportes/ReporteGeneral'

export const metadata = {
  title: 'Reporte General | Granja App'
}

export default function ReporteGeneralPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-6">Reporte General del Sistema</h1>
      <ReporteGeneral />
    </main>
  )
}