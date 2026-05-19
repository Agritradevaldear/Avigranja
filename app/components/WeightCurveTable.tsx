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
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? '▲' : '▼'} {Math.abs(diff)} g ({positive ? '+' : ''}{pct}%)
    </span>
  )
}

export default function WeightCurveTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Curva de Peso — Lote 08</h2>
          <p className="text-sm text-gray-500 mt-0.5">Peso real vs. estándar Ross Aviagen 308</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Nave A
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semana</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peso Real</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estándar Ross 308</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Diferencia</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Cumplimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {weightData.map(({ semana, real, standard }) => {
              const pct = (real / standard) * 100
              const barColor = pct >= 98 ? 'bg-[#1D9E75]' : pct >= 93 ? 'bg-yellow-400' : 'bg-red-400'
              return (
                <tr key={semana} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-800">Semana {semana}</td>
                  <td className="px-5 py-4 text-gray-800 font-medium">{formatGrams(real)}</td>
                  <td className="px-5 py-4 text-gray-500">{formatGrams(standard)}</td>
                  <td className="px-5 py-4">
                    <DiffBadge real={real} standard={standard} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums w-10 text-right">
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
