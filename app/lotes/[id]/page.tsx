import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Lote, Mortalidad, Pesaje } from '@/lib/supabase'
import MortalidadForm from './MortalidadForm'
import PesajeForm from './PesajeForm'

export const dynamic = 'force-dynamic'

const ROSS_308: Record<number, number> = {
  1: 0.20,
  2: 0.50,
  3: 0.95,
  4: 1.50,
  5: 2.10,
  6: 2.60,
}

function getSemana(fechaEntrada: string) {
  const days = Math.floor(
    (Date.now() - new Date(fechaEntrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  return Math.max(1, Math.floor(days / 7) + 1)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function DiffCell({ real, standard }: { real: number; standard: number }) {
  const diff = real - standard
  const pct = ((diff / standard) * 100).toFixed(1)
  const up = diff >= 0
  return (
    <span className={`text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? '▲' : '▼'} {Math.abs(diff).toFixed(3)} kg ({up ? '+' : ''}{pct}%)
    </span>
  )
}

export default async function LoteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const loteId = parseInt(id, 10)

  if (isNaN(loteId)) notFound()

  // ─── Parallel data fetch ──────────────────────────────────────────────────
  const [loteRes, mortRes, pesajesRes] = await Promise.all([
    supabase.from('lotes').select('*').eq('id', loteId).single(),
    supabase
      .from('mortalidad')
      .select('*')
      .eq('lote_id', loteId)
      .order('fecha', { ascending: false })
      .limit(10),
    supabase
      .from('pesajes')
      .select('*')
      .eq('lote_id', loteId)
      .order('semana', { ascending: true }),
  ])

  if (!loteRes.data) notFound()

  const lote = loteRes.data as Lote
  const mortalidad = (mortRes.data ?? []) as Mortalidad[]
  const pesajes = (pesajesRes.data ?? []) as Pesaje[]

  const semanaActual = getSemana(lote.fecha_entrada)
  const daysActive = Math.floor(
    (Date.now() - new Date(lote.fecha_entrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  const totalMort = mortalidad.reduce((s, r) => s + r.cantidad, 0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/lotes" className="hover:text-[#1D9E75] transition-colors">Lotes</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{lote.nombre}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {lote.nombre} — {lote.nave}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Semana {semanaActual} · {daysActive} días activos · {lote.num_pollos.toLocaleString('es-ES')} pollos
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            Activo
          </span>
        </div>

        {/* Info cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Nave', value: lote.nave },
            { label: 'Fecha entrada', value: formatDate(lote.fecha_entrada) },
            { label: 'Pollos iniciales', value: lote.num_pollos.toLocaleString('es-ES') },
            { label: 'Mortalidad acum.', value: totalMort.toLocaleString('es-ES') },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Forms row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MortalidadForm loteId={loteId} />
          <PesajeForm loteId={loteId} />
        </div>

        {/* History row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Mortalidad history */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Historial de mortalidad</h2>
              <p className="text-sm text-gray-500 mt-0.5">Últimas 10 entradas</p>
            </div>
            {mortalidad.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Sin registros de mortalidad aún.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bajas</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mortalidad.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {formatDate(m.fecha)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-red-600 tabular-nums">
                          {m.cantidad.toLocaleString('es-ES')}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                          {m.observaciones ?? <span className="italic text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pesajes history vs Ross 308 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Curva de peso vs Ross 308</h2>
              <p className="text-sm text-gray-500 mt-0.5">{pesajes.length} semana{pesajes.length !== 1 ? 's' : ''} registrada{pesajes.length !== 1 ? 's' : ''}</p>
            </div>
            {pesajes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Sin pesajes registrados aún.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sem.</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Real</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ross 308</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Diferencia</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Cumpl.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pesajes.map((p) => {
                      const standard = ROSS_308[p.semana]
                      const pct = standard ? (p.peso_real_kg / standard) * 100 : null
                      const barColor =
                        pct === null ? 'bg-gray-200'
                          : pct >= 98 ? 'bg-[#1D9E75]'
                          : pct >= 90 ? 'bg-yellow-400'
                          : 'bg-red-400'
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-gray-800">S{p.semana}</td>
                          <td className="px-5 py-3 font-medium text-gray-800 tabular-nums">
                            {p.peso_real_kg.toFixed(3)} kg
                          </td>
                          <td className="px-5 py-3 text-gray-500 tabular-nums">
                            {standard ? `${standard.toFixed(2)} kg` : '—'}
                          </td>
                          <td className="px-5 py-3">
                            {standard ? (
                              <DiffCell real={p.peso_real_kg} standard={standard} />
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {pct !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${barColor}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 tabular-nums w-9 text-right">
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
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
