'use client'

import { useActionState } from 'react'
import { upsertConfig, type ConfigState } from './actions'
import type { CostosConfig } from '@/lib/supabase'

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition'

interface Field {
  name: keyof Omit<CostosConfig, 'id' | 'created_at'>
  label: string
  hint: string
  step: string
}

const FIELDS: Field[] = [
  { name: 'precio_pollito',            label: 'Precio pollito ($/ud)',        hint: 'Costo de compra por pollito de 1 día', step: '0.001' },
  { name: 'precio_alimento_kg',        label: 'Precio alimento ($/kg)',       hint: 'Costo del concentrado por kilogramo', step: '0.001' },
  { name: 'medicina_por_pollo',        label: 'Medicina ($/pollo)',           hint: 'Costo estimado de medicina y vacunas por ave', step: '0.001' },
  { name: 'crianza_entrada_por_pollo', label: 'Crianza entrada ($/pollo)',    hint: 'Costo de preparación de nave por ave recibida', step: '0.001' },
  { name: 'crianza_salida_por_pollo',  label: 'Crianza salida ($/pollo)',     hint: 'Costo de mano de obra y logística de salida por ave', step: '0.001' },
  { name: 'precio_venta_kg',           label: 'Precio venta estimado ($/kg)', hint: 'Precio de referencia en canal para proyecciones', step: '0.001' },
]

export default function ConfigForm({ config }: { config: CostosConfig }) {
  const [state, action, pending] = useActionState<ConfigState, FormData>(upsertConfig, null)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
      <form action={action} className="space-y-5">
        {'error' in (state ?? {}) && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">
            {(state as { error: string }).error}
          </p>
        )}
        {'success' in (state ?? {}) && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-3 py-2">
            Configuración guardada correctamente.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FIELDS.map(({ name, label, hint, step }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type="number"
                required
                min={0}
                step={step}
                defaultValue={config[name]}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 bg-[#1D9E75] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#179060] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
              'Guardar configuración'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
