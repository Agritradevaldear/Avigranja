import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Lote, Mortalidad, Pesaje, Alimentacion } from '@/lib/supabase'
import MortalidadForm from './MortalidadForm'
import PesajeForm from './PesajeForm'
import AlimentacionForm from './AlimentacionForm'
import DeleteButton from './DeleteButton'
import VentaForm from './VentaForm'
import { deleteMortalidad, deletePesaje, deleteAlimentacion } from './actions'

export const dynamic = 'force-dynamic'

// ─── Ross 308 standards ───────────────────────────────────────────────────────

const ROSS_PESO: Record<number, number> = {
  1: 0.20, 2: 0.50, 3: 0.95, 4: 1.50, 5: 2.10, 6: 2.60,
}

const ROSS_ALIM_PER_1000: Record<number, number> = {
  1: 200, 2: 350, 3: 550, 4: 800, 5: 900, 6: 500,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSemana(fechaEntrada: string) {
  const days = Math.floor(
    (Date.now() - new Date(fechaEntrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  return Math.max(1, Math.floor(days / 7) + 1)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function ComplianceBar({ pct }: { pct: number }) {
  const color = pct >= 98 ? 'bg-[#1D9E75]' : pct >= 90 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-9 text-right">{pct.toFixed(0)}%</span>
    </div>
  )
}

function DiffKg({ real, standard }: { real: number; standard: number }) {
  const diff = real - standard
  const pct = ((diff / standard) * 100).toFixed(1)
  const up = diff >= 0
  return (
    <span className={`text-xs font-medium ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {up ? '▲' : '▼'} {Math.abs(diff).toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg ({up ? '+' : ''}{pct}%)
    </span>
  )
}

function DiffPeso({ real, standard }: { real: number; standard: number }) {
  const diff = real - standard
  const pct = ((diff / standard) * 100).toFixed(1)
  const up = diff >= 0
  return (
    <span className={`text-xs font-medium ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {up ? '▲' : '▼'} {Math.abs(diff).toFixed(3)} kg ({up ? '+' : ''}{pct}%)
    </span>
  )
}

// ─── Shared table styles ──────────────────────────────────────────────────────

const thClass = 'px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'
const tdPrimary = 'px-5 py-3 font-semibold text-zinc-800 dark:text-zinc-100'
const tdSecondary = 'px-5 py-3 text-zinc-500 dark:text-zinc-400'
const trClass = 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LoteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const loteId = parseInt(id, 10)
  if (isNaN(loteId)) notFound()

  const [loteRes, mortRes, pesajesRes, alimentacionRes] = await Promise.all([
    supabase.from('lotes').select('*').eq('id', loteId).single(),
    supabase.from('mortalidad').select('*').eq('lote_id', loteId)
      .order('fecha', { ascending: false }).limit(10),
    supabase.from('pesajes').select('*').eq('lote_id', loteId)
      .order('semana', { ascending: true }),
    supabase.from('alimentacion').select('*').eq('lote_id', loteId)
      .order('semana', { ascending: true }),
  ])

  if (!loteRes.data) notFound()

  const lote         = loteRes.data as Lote
  const mortalidad   = (mortRes.data        ?? []) as Mortalidad[]
  const pesajes      = (pesajesRes.data     ?? []) as Pesaje[]
  const alimentacion = (alimentacionRes.data ?? []) as Alimentacion[]

  const semanaActual = getSemana(lote.fecha_entrada)
  const daysActive   = Math.floor(
    (Date.now() - new Date(lote.fecha_entrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  const totalMort = mortalidad.reduce((s, r) => s + r.cantidad, 0)

  const estadoColors: Record<string, string> = {
    activo:     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    finalizado: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    cancelado:  'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href="/lotes" className="hover:text-[#1D9E75] transition-colors">Lotes</Link>
          <span>›</span>
          <span className="text-zinc-700 dark:text-zinc-200 font-medium">{lote.nombre}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {lote.nombre} — {lote.nave}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Semana {semanaActual} · {daysActive} días activos · {lote.num_pollos.toLocaleString('es-ES')} pollos
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${estadoColors[lote.estado] ?? estadoColors.activo}`}>
            {lote.estado.charAt(0).toUpperCase() + lote.estado.slice(1)}
          </span>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Nave',             value: lote.nave },
            { label: 'Fecha entrada',    value: formatDate(lote.fecha_entrada) },
            { label: 'Pollos iniciales', value: lote.num_pollos.toLocaleString('es-ES') },
            { label: 'Mortalidad acum.', value: totalMort.toLocaleString('es-ES') },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm px-4 py-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Forms — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MortalidadForm   loteId={loteId} />
          <PesajeForm       loteId={loteId} />
          <AlimentacionForm loteId={loteId} />
        </div>

        {/* History — mortalidad + pesajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Mortalidad history */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Historial de mortalidad</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Últimas 10 entradas</p>
            </div>
            {mortalidad.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">Sin registros aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                      {['Fecha', 'Bajas', 'Observaciones', ''].map((h, i) => (
                        <th key={i} className={thClass}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {mortalidad.map((m) => (
                      <tr key={m.id} className={trClass}>
                        <td className={tdSecondary + ' whitespace-nowrap'}>{formatDate(m.fecha)}</td>
                        <td className="px-5 py-3 font-semibold text-red-600 dark:text-red-400 tabular-nums">
                          {m.cantidad.toLocaleString('es-ES')}
                        </td>
                        <td className={tdSecondary + ' text-xs max-w-[180px] truncate'}>
                          {m.observaciones ?? <span className="italic text-zinc-300 dark:text-zinc-600">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          <DeleteButton action={deleteMortalidad.bind(null, m.id, loteId)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pesajes vs Ross 308 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Curva de peso vs Ross 308</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {pesajes.length} semana{pesajes.length !== 1 ? 's' : ''} registrada{pesajes.length !== 1 ? 's' : ''}
              </p>
            </div>
            {pesajes.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">Sin pesajes registrados aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                      {['Sem.', 'Real', 'Ross 308', 'Diferencia', 'Cumpl.', ''].map((h, i) => (
                        <th key={i} className={thClass}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {pesajes.map((p) => {
                      const std = ROSS_PESO[p.semana]
                      const pct = std ? (p.peso_real_kg / std) * 100 : null
                      return (
                        <tr key={p.id} className={trClass}>
                          <td className={tdPrimary}>S{p.semana}</td>
                          <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100 tabular-nums">{p.peso_real_kg.toFixed(3)} kg</td>
                          <td className={tdSecondary + ' tabular-nums'}>{std ? `${std.toFixed(2)} kg` : '—'}</td>
                          <td className="px-5 py-3">
                            {std ? <DiffPeso real={p.peso_real_kg} standard={std} /> : <span className="text-zinc-400 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3 w-28">
                            {pct !== null ? <ComplianceBar pct={pct} /> : <span className="text-zinc-400 text-xs">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            <DeleteButton action={deletePesaje.bind(null, p.id, loteId)} />
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

        {/* Alimentación vs Ross 308 — full width */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Consumo de alimento vs Ross 308</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Objetivo calculado sobre {lote.num_pollos.toLocaleString('es-ES')} pollos ·{' '}
              {alimentacion.length} semana{alimentacion.length !== 1 ? 's' : ''} registrada{alimentacion.length !== 1 ? 's' : ''}
            </p>
          </div>
          {alimentacion.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
              Sin registros de alimentación aún.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                    {['Semana', 'Consumo real', 'Objetivo Ross 308', 'Diferencia', 'Cumplimiento', ''].map((h, i) => (
                      <th key={i} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {alimentacion.map((a) => {
                    const stdPer1000 = ROSS_ALIM_PER_1000[a.semana]
                    const objetivo = stdPer1000 ? (stdPer1000 / 1000) * lote.num_pollos : null
                    const pct = objetivo ? (a.consumo_real_kg / objetivo) * 100 : null
                    return (
                      <tr key={a.id} className={trClass}>
                        <td className={tdPrimary}>Semana {a.semana}</td>
                        <td className="px-5 py-4 font-medium text-zinc-800 dark:text-zinc-100 tabular-nums">
                          {a.consumo_real_kg.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg
                        </td>
                        <td className={tdSecondary + ' tabular-nums'}>
                          {objetivo
                            ? `${objetivo.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg`
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {objetivo
                            ? <DiffKg real={a.consumo_real_kg} standard={objetivo} />
                            : <span className="text-zinc-400 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-4 w-36">
                          {pct !== null ? <ComplianceBar pct={pct} /> : <span className="text-zinc-400 text-xs">—</span>}
                        </td>
                        <td className="px-3 py-4">
                          <DeleteButton action={deleteAlimentacion.bind(null, a.id, loteId)} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Venta / cierre de lote */}
        {lote.estado === 'activo' && (
          <div className="max-w-xl">
            <VentaForm loteId={loteId} />
          </div>
        )}

      </main>
    </div>
  )
}
