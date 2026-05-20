'use client'

import { useActionState } from 'react'
import { createAlimentacion, type ActionState } from './actions'

// kg consumed per 1000 birds — objective label only (total depends on lote size)
const ROSS_ALIM_PER_1000: Record<number, number> = {
  1: 200,
  2: 350,
  3: 550,
  4: 800,
  5: 900,
  6: 500,
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition'

export default function AlimentacionForm({ loteId }: { loteId: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createAlimentacion,
    null,
  )

  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 shadow-sm p-5">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
        Registrar alimento semanal
      </h2>

      <form action={action} className="space-y-4">
        <input type="hidden" name="lote_id" value={loteId} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="alim-semana" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Semana
          </label>
          <select
            id="alim-semana"
            name="semana"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>Selecciona semana...</option>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <option key={s} value={s}>
                Semana {s} — Obj. Ross: {ROSS_ALIM_PER_1000[s]} kg/1000 pollos
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="alim-consumo" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Consumo real (kg)
          </label>
          <input
            id="alim-consumo"
            name="consumo_real_kg"
            type="number"
            required
            min={0.1}
            step={0.1}
            placeholder="Ej: 62500"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
            'Registrar alimento'
          )}
        </button>
      </form>
    </div>
  )
}
