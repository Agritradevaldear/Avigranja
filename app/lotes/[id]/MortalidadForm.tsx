'use client'

import { useActionState } from 'react'
import { createMortalidad, type ActionState } from './actions'

const todayISO = new Date().toISOString().split('T')[0]

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition'

export default function MortalidadForm({ loteId }: { loteId: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createMortalidad,
    null,
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Registrar mortalidad
      </h2>

      <form action={action} className="space-y-4">
        <input type="hidden" name="lote_id" value={loteId} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="mort-fecha" className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha
          </label>
          <input
            id="mort-fecha"
            name="fecha"
            type="date"
            required
            defaultValue={todayISO}
            max={todayISO}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="mort-cantidad" className="block text-sm font-medium text-gray-700 mb-1.5">
            Cantidad de bajas
          </label>
          <input
            id="mort-cantidad"
            name="cantidad"
            type="number"
            required
            min={1}
            placeholder="Ej: 45"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="mort-obs" className="block text-sm font-medium text-gray-700 mb-1.5">
            Observaciones{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="mort-obs"
            name="observaciones"
            rows={2}
            placeholder="Causa probable, zona afectada..."
            className={inputClass + ' resize-none'}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
            'Registrar mortalidad'
          )}
        </button>
      </form>
    </div>
  )
}
