'use client'

import { useActionState, useState } from 'react'
import { createVenta, type ActionState } from './actions'

const todayISO = new Date().toISOString().split('T')[0]

const inputClass =
  'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm ' +
  'text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

interface Props {
  loteId: number
  polosVivos: number
}

function fmt$(n: number) {
  return '$' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function VentaForm({ loteId, polosVivos }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createVenta, null)

  const [pollosVendidos, setPollosVendidos] = useState(String(polosVivos))
  const [pesoMedioKg, setPesoMedioKg]       = useState('')
  const [pesoTotalKg, setPesoTotalKg]       = useState('')
  const [mermaKg, setMermaKg]               = useState('0')
  const [precioKg, setPrecioKg]             = useState('')

  function handlePollosChange(val: string) {
    setPollosVendidos(val)
    const pollos = parseInt(val, 10)
    const medio = parseFloat(pesoMedioKg)
    if (pollos > 0 && medio > 0) setPesoTotalKg((pollos * medio).toFixed(1))
  }

  function handlePesoMedioChange(val: string) {
    setPesoMedioKg(val)
    const pollos = parseInt(pollosVendidos, 10)
    const medio = parseFloat(val)
    if (pollos > 0 && medio > 0) setPesoTotalKg((pollos * medio).toFixed(1))
  }

  function handlePesoTotalChange(val: string) {
    setPesoTotalKg(val)
    const total = parseFloat(val)
    const pollos = parseInt(pollosVendidos, 10)
    if (total > 0 && pollos > 0) setPesoMedioKg((total / pollos).toFixed(3))
  }

  const totalNum  = parseFloat(pesoTotalKg)
  const precioNum = parseFloat(precioKg)
  const mermaNum  = parseFloat(mermaKg) || 0
  const pollosNum = parseInt(pollosVendidos, 10)
  const medioNum  = parseFloat(pesoMedioKg)
  const showSummary = totalNum > 0 && precioNum > 0

  const pesoNeto      = showSummary ? Math.max(0, totalNum - mermaNum) : 0
  const totalIngresos = showSummary ? pesoNeto * precioNum : 0

  return (
    <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 shadow-sm p-5">
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

        <div className="grid grid-cols-2 gap-3">
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

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="venta-pollos" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Pollos vendidos
            </label>
            <input
              id="venta-pollos"
              name="num_pollos_vendidos"
              type="number"
              required
              min={1}
              value={pollosVendidos}
              onChange={(e) => handlePollosChange(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="venta-peso-medio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Peso medio canal <span className="text-gray-400 font-normal">(kg/pollo)</span>
            </label>
            <input
              id="venta-peso-medio"
              name="peso_medio_kg"
              type="number"
              min={0.1}
              step={0.001}
              placeholder="Ej: 2.450"
              value={pesoMedioKg}
              onChange={(e) => handlePesoMedioChange(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
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
              value={pesoTotalKg}
              onChange={(e) => handlePesoTotalChange(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="venta-merma" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Merma en transporte (kg)
            </label>
            <input
              id="venta-merma"
              name="merma_kg"
              type="number"
              min={0}
              step={0.1}
              value={mermaKg}
              onChange={(e) => setMermaKg(e.target.value)}
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
              value={precioKg}
              onChange={(e) => setPrecioKg(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Live preview */}
        {showSummary && (
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Resumen de la operación
            </p>
            {!isNaN(pollosNum) && !isNaN(medioNum) && medioNum > 0 ? (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">{pollosNum.toLocaleString('es-ES')} pollos</span>
                {' × '}
                <span className="font-medium">{medioNum.toFixed(3)} kg/pollo</span>
                {' = '}
                <span className="font-semibold">{totalNum.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg</span>
              </p>
            ) : (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Peso total: <span className="font-semibold">{totalNum.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg</span>
              </p>
            )}
            {mermaNum > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {'− merma '}
                {mermaNum.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg
                {' = peso neto '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {pesoNeto.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg
                </span>
              </p>
            )}
            <div className="pt-1.5 border-t border-indigo-200 dark:border-indigo-800/40 flex items-baseline justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {pesoNeto.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg × {fmt$(precioNum)}/kg
              </span>
              <span className="text-base font-bold text-indigo-700 dark:text-indigo-400">
                {fmt$(totalIngresos)}
              </span>
            </div>
          </div>
        )}

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
