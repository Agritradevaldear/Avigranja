import type { Lote } from '@/lib/supabase'

interface Props {
  lotes: Lote[]
}

function getSemana(fechaEntrada: string): number {
  const days = Math.floor(
    (Date.now() - new Date(fechaEntrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  return Math.max(1, Math.floor(days / 7) + 1)
}

export default function LotesTable({ lotes }: Props) {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Lotes Activos</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {lotes.length} lote{lotes.length !== 1 ? 's' : ''} en producción
        </p>
      </div>

      {lotes.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No hay lotes activos actualmente.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                {['Lote', 'Nave', 'Pollos', 'Semana', 'Estado'].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {lotes.map((lote) => (
                <tr key={lote.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-100">{lote.nombre}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{lote.nave}</td>
                  <td className="px-6 py-4 text-zinc-800 dark:text-zinc-100 font-medium tabular-nums">
                    {lote.num_pollos.toLocaleString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    Semana {getSemana(lote.fecha_entrada)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
