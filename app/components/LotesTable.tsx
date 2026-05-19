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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Lotes Activos</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {lotes.length} lote{lotes.length !== 1 ? 's' : ''} en producción
        </p>
      </div>

      {lotes.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No hay lotes activos actualmente.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lote</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nave</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pollos</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semana</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lotes.map((lote) => (
                <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-800">{lote.nombre}</td>
                  <td className="px-5 py-4 text-gray-600">{lote.nave}</td>
                  <td className="px-5 py-4 text-gray-800 font-medium tabular-nums">
                    {lote.num_pollos.toLocaleString('es-ES')}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    Semana {getSemana(lote.fecha_entrada)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
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
