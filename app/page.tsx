import Link from 'next/link'
import Navbar from './components/Navbar'
import KPICard from './components/KPICard'
import LotesTable from './components/LotesTable'
import AlertsPanel from './components/AlertsPanel'
import WeightCurveTable from './components/WeightCurveTable'
import { getDashboardData } from '@/lib/dashboard-data'
import type { VentaCerrada } from '@/lib/dashboard-data'

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

function fmt$(n: number): string {
  return '$' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function Dashboard() {
  const { lotes, kpis, alerts, financiero } = await getDashboardData()

  const polosActivosStr = kpis.polosActivos.toLocaleString('es-ES')
  const mortSemanaStr   = kpis.mortSemana.toLocaleString('es-ES')
  const mortPctStr      = `${kpis.mortPct.toFixed(2)}% sobre pollos activos`
  const costoPorKgStr   = `$${kpis.costoPorKg.toFixed(2)}/kg`

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Resumen operativo · Semana actual</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Pollos Activos"
            value={polosActivosStr}
            subtitle={`${lotes.length} lote${lotes.length !== 1 ? 's' : ''} en producción`}
            icon={<ChickenIcon />}
            iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
            barColorClass="bg-[#1D9E75]"
          />
          <KPICard
            title="Mortalidad Semana"
            value={mortSemanaStr}
            subtitle={mortPctStr}
            icon={<HeartIcon />}
            iconBgClass="bg-red-50 dark:bg-red-900/30"
            barColorClass="bg-red-500"
          />
          <KPICard
            title="Costo / kg est."
            value={costoPorKgStr}
            subtitle="Basado en costos configurados"
            icon={<CurrencyIcon />}
            iconBgClass="bg-blue-50 dark:bg-blue-900/30"
            barColorClass="bg-blue-500"
          />
          <KPICard
            title="Alimento Semana"
            value={formatToneladas(kpis.alimentacionSemanaKg)}
            subtitle="Consumo total de concentrado"
            icon={<GrainIcon />}
            iconBgClass="bg-amber-50 dark:bg-amber-900/30"
            barColorClass="bg-amber-500"
          />
        </div>

        {/* Lotes + Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <LotesTable lotes={lotes} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        {/* Weight Curve */}
        <div className="mb-6">
          <WeightCurveTable />
        </div>

        {/* Financial Summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Resumen financiero</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Lotes activos · Costos reales y proyección de ingresos</p>
            </div>
            {!financiero.config && (
              <Link href="/configuracion" className="text-sm text-[#1D9E75] font-medium hover:underline">
                Configurar precios →
              </Link>
            )}
          </div>

          {/* Financial KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Costo total activos</p>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-1">{fmt$(financiero.costoTotalActivos)}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Pollito + alimento + medicina + crianza</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Ingreso proyectado</p>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-1">{fmt$(financiero.ingresoProyectado)}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                {financiero.config ? `Pollos × 2.60 kg × $${financiero.config.precio_venta_kg}/kg` : 'Configura los precios para ver la proyección'}
              </p>
            </div>
            <div className={`bg-white dark:bg-zinc-900 rounded-2xl border p-6 shadow-sm ${financiero.margenProyectado >= 0 ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-red-200 dark:border-red-900/50'}`}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Margen proyectado</p>
              <p className={`text-2xl font-bold mt-1 ${financiero.margenProyectado >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {fmt$(financiero.margenProyectado)}
              </p>
              <p className={`text-xs mt-1 ${financiero.margenProyectado >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500 dark:text-red-400'}`}>
                {financiero.ingresoProyectado > 0 ? `${financiero.margenPct.toFixed(1)}% sobre ingresos proyectados` : '—'}
              </p>
            </div>
          </div>

          {/* Ventas cerradas */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Últimas ventas cerradas</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {financiero.ventasCerradas.length} venta{financiero.ventasCerradas.length !== 1 ? 's' : ''} registrada{financiero.ventasCerradas.length !== 1 ? 's' : ''}
              </p>
            </div>
            {financiero.ventasCerradas.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
                No hay ventas registradas aún. Cierra un lote desde su página de detalle.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                      {['Lote', 'Fecha venta', 'Kg netos', 'Ingresos', 'Costo est.', 'Beneficio'].map((h) => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {financiero.ventasCerradas.map((v: VentaCerrada) => (
                      <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-100">{v.loteNombre}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(v.fechaVenta)}</td>
                        <td className="px-6 py-4 text-zinc-800 dark:text-zinc-100 tabular-nums">
                          {v.pesoNetoKg.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-800 dark:text-zinc-100 tabular-nums">{fmt$(v.ingresos)}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 tabular-nums">{fmt$(v.costoEstimado)}</td>
                        <td className="px-6 py-4 tabular-nums">
                          <span className={`font-semibold ${v.beneficio >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {v.beneficio >= 0 ? '+' : ''}{fmt$(v.beneficio)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
