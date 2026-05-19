import Navbar from './components/Navbar'
import KPICard from './components/KPICard'
import LotesTable from './components/LotesTable'
import AlertsPanel from './components/AlertsPanel'
import WeightCurveTable from './components/WeightCurveTable'
import { getDashboardData } from '@/lib/dashboard-data'

export const dynamic = 'force-dynamic'

function ChickenIcon() {
  return (
    <svg className="w-6 h-6 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function GrainIcon() {
  return (
    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function formatToneladas(kg: number): string {
  if (kg === 0) return '0 t'
  const t = kg / 1000
  return t >= 1 ? `${t.toFixed(1)} t` : `${kg.toFixed(0)} kg`
}

export default async function Dashboard() {
  const { lotes, kpis, alerts } = await getDashboardData()

  const polosActivosStr = kpis.polosActivos.toLocaleString('es-ES')
  const mortSemanaStr = kpis.mortSemana.toLocaleString('es-ES')
  const mortPctStr = `${kpis.mortPct.toFixed(2)}% sobre pollos activos`

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen operativo · Semana actual</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Pollos Activos"
            value={polosActivosStr}
            subtitle={`${lotes.length} lote${lotes.length !== 1 ? 's' : ''} en producción`}
            icon={<ChickenIcon />}
            iconBgClass="bg-green-50"
          />
          <KPICard
            title="Mortalidad Semana"
            value={mortSemanaStr}
            subtitle={mortPctStr}
            icon={<HeartIcon />}
            iconBgClass="bg-red-50"
          />
          <KPICard
            title="Costo / kg"
            value="$1.08"
            subtitle="Promedio últimas 4 semanas"
            icon={<CurrencyIcon />}
            iconBgClass="bg-blue-50"
          />
          <KPICard
            title="Alimento Semana"
            value={formatToneladas(kpis.alimentacionSemanaKg)}
            subtitle="Consumo total de concentrado"
            icon={<GrainIcon />}
            iconBgClass="bg-amber-50"
          />
        </div>

        {/* Lotes + Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <LotesTable lotes={lotes} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        {/* Weight Curve */}
        <WeightCurveTable />

      </main>
    </div>
  )
}
