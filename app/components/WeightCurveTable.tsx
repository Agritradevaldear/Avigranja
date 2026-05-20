const weightData = [
  { semana: 1, real: 175, standard: 180 },
  { semana: 2, real: 442, standard: 430 },
  { semana: 3, real: 818, standard: 800 },
  { semana: 4, real: 1_238, standard: 1_250 },
  { semana: 5, real: 1_782, standard: 1_800 },
]

function formatGrams(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`
}

function DiffBadge({ real, standard }: { real: number; standard: number }) {
  const diff = real - standard
  const pct = ((diff / standard) * 100).toFixed(1)
  const positive = diff >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {positive ? '▲' : '▼'} {Math.abs(diff)} g ({positive ? '+' : ''}{pct}%)
    </span>
  )
}

export default function WeightCurveTable() {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Curva de Peso — Lote 08</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Peso real vs. estándar Ross Aviagen 308</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          Nave A
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
              {['Semana', 'Peso Real', 'Estándar Ross 308', 'Diferencia', 'Cumplimiento'].map((h) => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {weightData.map(({ semana, real, standard }) => {
              const pct = (real / standard) * 100
              const barColor = pct >= 98 ? 'bg-[#1D9E75]' : pct >= 93 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <tr key={semana} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-100">Semana {semana}</td>
                  <td className="px-6 py-4 text-zinc-800 dark:text-zinc-100 font-medium">{formatGrams(real)}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatGrams(standard)}</td>
                  <td className="px-6 py-4">
                    <DiffBadge real={real} standard={standard} />
                  </td>
                  <td className="px-6 py-4 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-10 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
