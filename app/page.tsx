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

function TrendIcon({ up }: { up: boolean }) {
  return up
    ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    : <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
}

export default async function Dashboard() {
  const { lotes, kpis, alerts, financiero } = await getDashboardData()

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

        {/* Financial Summary */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Resumen financiero</h2>
              <p className="text-sm text-gray-500 mt-0.5">Lotes activos · Costos reales y proyección de ingresos</p>
            </div>
            {!financiero.config && (
              <Link
                href="/configuracion"
                className="text-sm text-[#1D9E75] font-medium hover:underline"
              >
                Configurar precios →
              </Link>
            )}
          </div>

          {/* Financial KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Costo total activos</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmt$(financiero.costoTotalActivos)}</p>
              <p className="text-xs text-gray-400 mt-1">Pollito + alimento + medicina + crianza</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Ingreso proyectado</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmt$(financiero.ingresoProyectado)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {financiero.config
                  ? `Pollos activos × 2.60 kg × $${financiero.config.precio_venta_kg}/kg`
                  : 'Configura los precios para ver la proyección'}
              </p>
            </div>

            <div className={`bg-white rounded-xl border p-5 shadow-sm ${financiero.margenProyectado >= 0 ? 'border-green-200' : 'border-red-200'}`}>
              <p className="text-sm text-gray-500 font-medium">Margen proyectado</p>
              <p className={`text-2xl font-bold mt-1 ${financiero.margenProyectado >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {fmt$(financiero.margenProyectado)}
              </p>
              <p className={`text-xs mt-1 ${financiero.margenProyectado >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {financiero.ingresoProyectado > 0
                  ? `${financiero.margenPct.toFixed(1)}% sobre ingresos proyectados`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Ventas cerradas table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Últimas ventas cerradas</h3>
                <p className="text-sm text-gray-500 mt-0.5">{financiero.ventasCerradas.length} venta{financiero.ventasCerradas.length !== 1 ? 's' : ''} registrada{financiero.ventasCerradas.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {financiero.ventasCerradas.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                No hay ventas registradas aún. Cierra un lote desde su página de detalle.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {['Lote', 'Fecha venta', 'Kg netos', 'Ingresos', 'Costo est.', 'Beneficio'].map((h) => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {financiero.ventasCerradas.map((v: VentaCerrada) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-gray-800">{v.loteNombre}</td>
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(v.fechaVenta)}</td>
                        <td className="px-5 py-4 text-gray-800 tabular-nums">
                          {v.pesoNetoKg.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-800 tabular-nums">{fmt$(v.ingresos)}</td>
                        <td className="px-5 py-4 text-gray-500 tabular-nums">{fmt$(v.costoEstimado)}</td>
                        <td className="px-5 py-4 tabular-nums">
                          <span className={`font-semibold ${v.beneficio >= 0 ? 'text-green-700' : 'text-red-600'}`}>
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
