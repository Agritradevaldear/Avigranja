'use client'

import { useState } from 'react'
import type { Lote, Pesaje } from '@/lib/supabase'

const ROSS_308: Record<number, number> = {
  1: 0.20, 2: 0.50, 3: 0.95, 4: 1.50, 5: 2.10, 6: 2.60,
}

function getSemana(fechaEntrada: string): number {
  const days = Math.floor(
    (Date.now() - new Date(fechaEntrada + 'T00:00:00').getTime()) / 86_400_000,
  )
  return Math.max(1, Math.floor(days / 7) + 1)
}

function ComplianceBar({ pct }: { pct: number }) {
  const color = pct >= 98 ? 'bg-[#1D9E75]' : pct >= 90 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-9 text-right">
        {pct.toFixed(0)}%
      </span>
    </div>
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

interface Props {
  lotes: Lote[]
  pesajesPorLote: Record<number, Pesaje[]>
}

export default function WeightCurveAccordion({ lotes, pesajesPorLote }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(lotes[0]?.id ?? null)

  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          Curvas de peso — Lotes activos
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Peso real vs. estándar Ross Aviagen 308
        </p>
      </div>

      {lotes.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No hay lotes activos.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {lotes.map((lote) => {
            const isOpen = expandedId === lote.id
            const pesajes = pesajesPorLote[lote.id] ?? []
            const semana = getSemana(lote.fecha_entrada)

            return (
              <div key={lote.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : lote.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                      {lote.nombre}
                    </span>
                    <span className="text-sm text-zinc-400 dark:text-zinc-500">{lote.nave}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Sem. {semana}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                      Activo
                    </span>
                    <svg
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    {pesajes.length === 0 ? (
                      <p className="px-6 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                        Sin pesajes registrados aún.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                              {['Semana', 'Peso real', 'Ross 308', 'Diferencia', 'Cumplimiento'].map((h) => (
                                <th key={h} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {pesajes.map((p) => {
                              const std = ROSS_308[p.semana]
                              const pct = std ? (p.peso_real_kg / std) * 100 : null
                              return (
                                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                  <td className="px-6 py-3 font-semibold text-zinc-800 dark:text-zinc-100">
                                    S{p.semana}
                                  </td>
                                  <td className="px-6 py-3 font-medium text-zinc-800 dark:text-zinc-100 tabular-nums">
                                    {p.peso_real_kg.toFixed(3)} kg
                                  </td>
                                  <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400 tabular-nums">
                                    {std ? `${std.toFixed(2)} kg` : '—'}
                                  </td>
                                  <td className="px-6 py-3">
                                    {std
                                      ? <DiffPeso real={p.peso_real_kg} standard={std} />
                                      : <span className="text-zinc-400 text-xs">—</span>}
                                  </td>
                                  <td className="px-6 py-3 w-36">
                                    {pct !== null
                                      ? <ComplianceBar pct={pct} />
                                      : <span className="text-zinc-400 text-xs">—</span>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
