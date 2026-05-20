import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Lote, LoteEstado } from '@/lib/supabase'
import DeleteLoteButton from './DeleteLoteButton'
import { deleteLote } from './actions'

export const dynamic = 'force-dynamic'

const estadoBadge: Record<LoteEstado, string> = {
  activo:     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  finalizado: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  cancelado:  'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
}

const estadoLabel: Record<LoteEstado, string> = {
  activo:     'Activo',
  finalizado: 'Finalizado',
  cancelado:  'Cancelado',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function LotesPage() {
  const { data: raw, error } = await supabase
    .from('lotes')
    .select('*')
    .order('created_at', { ascending: false })

  const lotes = raw as Lote[] | null
  const activos = lotes?.filter((l) => l.estado === 'activo').length ?? 0

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Lotes</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {activos} lote{activos !== 1 ? 's' : ''} activo{activos !== 1 ? 's' : ''}
              {lotes && lotes.length > activos ? ` · ${lotes.length - activos} finalizado${lotes.length - activos !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <Link
            href="/lotes/nuevo"
            className="inline-flex items-center gap-2 bg-[#1D9E75] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#179060] transition-colors shrink-0 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Lote
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            Error al cargar los lotes: {error.message}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          {!lotes?.length && !error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No hay lotes registrados</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Crea el primer lote para comenzar.</p>
              <Link
                href="/lotes/nuevo"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#1D9E75] font-medium hover:underline"
              >
                + Crear primer lote
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                    {['Nombre', 'Nave', 'Fecha Entrada', 'Núm. Pollos', 'Ciclo', 'Estado', '', ''].map((h, i) => (
                      <th key={i} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {lotes?.map((lote) => (
                    <tr key={lote.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-100">{lote.nombre}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{lote.nave}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(lote.fecha_entrada)}</td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-zinc-100 font-medium tabular-nums">
                        {lote.num_pollos.toLocaleString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{lote.semanas_ciclo} sem.</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoBadge[lote.estado as LoteEstado]}`}>
                          {estadoLabel[lote.estado as LoteEstado] ?? lote.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/lotes/${lote.id}`}
                          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-[#1D9E75] dark:hover:text-[#1D9E75] transition-colors"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                      <td className="px-3 py-4">
                        <DeleteLoteButton
                          action={deleteLote.bind(null, lote.id)}
                          loteName={lote.nombre}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
