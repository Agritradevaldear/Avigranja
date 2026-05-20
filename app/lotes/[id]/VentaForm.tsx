'use client'

import { useActionState } from 'react'
import { createVenta, type ActionState } from './actions'

const todayISO = new Date().toISOString().split('T')[0]

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

export default function VentaForm({ loteId }: { loteId: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createVenta, null)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-50 shrink-0">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Registrar venta / cierre de lote</h2>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
            Al guardar, el lote pasará al estado <strong>Finalizado</strong> de forma permanente.
          </p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="lote_id" value={loteId} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="venta-fecha" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Fecha de venta
            </label>
            <input
              id="venta-fecha"
              name="fecha_venta"
              type="date"
              required
              defaultValue={todayISO}
              max={todayISO}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="venta-comprador" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Comprador <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="venta-comprador"
              name="comprador"
              type="text"
              placeholder="Nombre o empresa"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="venta-peso" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Peso total en canal (kg)
            </label>
            <input
              id="venta-peso"
              name="peso_total_kg"
              type="number"
              required
              min={0.1}
              step={0.1}
              placeholder="Ej: 18500"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="venta-merma" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Merma en transporte (kg)
            </label>
            <input
              id="venta-merma"
              name="merma_kg"
              type="number"
              min={0}
              step={0.1}
              defaultValue={0}
              className={inputClass}
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="venta-precio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Precio por kg ($)
            </label>
            <input
              id="venta-precio"
              name="precio_kg"
              type="number"
              required
              min={0.01}
              step={0.001}
              placeholder="Ej: 1.20"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Registrando venta...
            </>
          ) : (
            'Registrar venta y cerrar lote'
          )}
        </button>
      </form>
    </div>
  )
}
