'use client'

import { useActionState } from 'react'
import { createPesaje, type ActionState } from './actions'

const ROSS_308: Record<number, number> = {
  1: 0.20,
  2: 0.50,
  3: 0.95,
  4: 1.50,
  5: 2.10,
  6: 2.60,
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition'

export default function PesajeForm({ loteId }: { loteId: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createPesaje,
    null,
  )

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
        Registrar pesaje semanal
      </h2>

      <form action={action} className="space-y-4">
        <input type="hidden" name="lote_id" value={loteId} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="pesaje-semana" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Semana
          </label>
          <select
            id="pesaje-semana"
            name="semana"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>Selecciona semana...</option>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <option key={s} value={s}>
                Semana {s} — Estándar Ross: {ROSS_308[s].toFixed(2)} kg
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pesaje-peso" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Peso promedio real (kg)
          </label>
          <input
            id="pesaje-peso"
            name="peso_real_kg"
            type="number"
            required
            min={0.01}
            step={0.001}
            placeholder="Ej: 1.450"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-[#1D9E75] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#179060] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Registrar pesaje'
          )}
        </button>
      </form>
    </div>
  )
}
