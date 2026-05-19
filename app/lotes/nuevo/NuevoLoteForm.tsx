'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createLote, type ActionState } from '@/app/lotes/actions'

const NAVES = ['Nave A', 'Nave B', 'Nave C']

const todayISO = new Date().toISOString().split('T')[0]

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition'

export default function NuevoLoteForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createLote, null)

  return (
    <form action={action} className="space-y-5">

      {state?.error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {state.error}
        </div>
      )}

      <div>
        <FieldLabel htmlFor="nombre">Nombre del lote</FieldLabel>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Lote 11"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="nave">Nave</FieldLabel>
        <select
          id="nave"
          name="nave"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>Selecciona una nave...</option>
          {NAVES.map((nave) => (
            <option key={nave} value={nave}>{nave}</option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="fecha_entrada">Fecha de entrada</FieldLabel>
        <input
          id="fecha_entrada"
          name="fecha_entrada"
          type="date"
          required
          defaultValue={todayISO}
          max={todayISO}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="num_pollos">Número de pollos</FieldLabel>
          <input
            id="num_pollos"
            name="num_pollos"
            type="number"
            required
            min={1}
            max={500000}
            placeholder="Ej: 114000"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="semanas_ciclo">Semanas de ciclo</FieldLabel>
          <input
            id="semanas_ciclo"
            name="semanas_ciclo"
            type="number"
            required
            min={1}
            max={20}
            defaultValue={6}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] text-white py-2.5 px-5 rounded-lg text-sm font-semibold hover:bg-[#178a65] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
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
            'Guardar lote'
          )}
        </button>
        <Link
          href="/lotes"
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>

    </form>
  )
}
