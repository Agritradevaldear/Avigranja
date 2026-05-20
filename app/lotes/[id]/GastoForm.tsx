'use client'

import { useActionState } from 'react'
import { createGasto, type ActionState } from './actions'

const todayISO = new Date().toISOString().split('T')[0]

const CATEGORIAS = ['Pienso', 'Medicina', 'Crianza', 'Concha de arroz', 'Otros'] as const

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition'

export default function GastoForm({ loteId }: { loteId: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createGasto, null)

  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 shadow-sm p-5">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
        Registrar gasto
      </h2>

      <form action={action} className="space-y-4">
        <input type="hidden" name="lote_id" value={loteId} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="gasto-categoria" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Categoría
          </label>
          <select
            id="gasto-categoria"
            name="categoria"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>Selecciona categoría...</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gasto-importe" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Importe ($)
            </label>
            <input
              id="gasto-importe"
              name="importe"
              type="number"
              required
              min={0.01}
              step={0.01}
              placeholder="Ej: 1250.00"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="gasto-fecha" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Fecha
            </label>
            <input
              id="gasto-fecha"
              name="fecha"
              type="date"
              required
              defaultValue={todayISO}
              max={todayISO}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="gasto-descripcion" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Descripción <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="gasto-descripcion"
            name="descripcion"
            type="text"
            placeholder="Ej: Saco 25 kg marca X"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
            'Registrar gasto'
          )}
        </button>
      </form>
    </div>
  )
}
