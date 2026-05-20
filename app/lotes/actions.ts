'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { error: string } | null

export async function createLote(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nombre             = (formData.get('nombre') as string)?.trim()
  const nave               = formData.get('nave') as string
  const fecha_entrada      = formData.get('fecha_entrada') as string
  const num_pollos_raw     = formData.get('num_pollos') as string
  const semanas_ciclo_raw  = formData.get('semanas_ciclo') as string
  const precio_pollito_raw = formData.get('precio_pollito') as string

  if (!nombre || !nave || !fecha_entrada || !num_pollos_raw || !semanas_ciclo_raw) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  const num_pollos    = parseInt(num_pollos_raw, 10)
  const semanas_ciclo = parseInt(semanas_ciclo_raw, 10)
  const precio_pollito = parseFloat(precio_pollito_raw)

  if (isNaN(num_pollos) || num_pollos <= 0) {
    return { error: 'El número de pollos debe ser un valor positivo.' }
  }
  if (isNaN(semanas_ciclo) || semanas_ciclo < 1 || semanas_ciclo > 20) {
    return { error: 'Las semanas de ciclo deben estar entre 1 y 20.' }
  }

  const { data: loteData, error } = await supabase
    .from('lotes')
    .insert({ nombre, nave, fecha_entrada, num_pollos, semanas_ciclo, estado: 'activo' })
    .select('id')
    .single()

  if (error) return { error: `Error al guardar: ${error.message}` }

  // Auto-register pollito acquisition cost
  if (!isNaN(precio_pollito) && precio_pollito > 0) {
    const { error: gastoError } = await supabase.from('gastos_lote').insert({
      lote_id:     loteData.id,
      categoria:   'Pollito',
      descripcion: 'Coste de adquisición de pollitos',
      importe:     num_pollos * precio_pollito,
      fecha:       fecha_entrada,
    })
    if (gastoError) {
      // Lote already created — surface the gastos failure rather than silently losing it
      return {
        error: `Lote creado (id ${loteData.id}), pero falló el registro del gasto de pollitos: ${gastoError.message}. Revisa que el constraint SQL de gastos_lote incluya 'Pollito'.`,
      }
    }
  }

  revalidatePath('/lotes')
  redirect('/lotes')
}

// ─── Delete lote (cascade handled by DB constraints) ─────────────────────────

export async function deleteLote(id: number): Promise<void> {
  await supabase.from('lotes').delete().eq('id', id)
  revalidatePath('/')
  revalidatePath('/lotes')
  redirect('/lotes')
}
