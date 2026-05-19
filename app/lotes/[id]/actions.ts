'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { error: string } | null

// ─── Mortalidad ───────────────────────────────────────────────────────────────

export async function createMortalidad(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lote_id = parseInt(formData.get('lote_id') as string, 10)
  const fecha = (formData.get('fecha') as string)?.trim()
  const cantidad_raw = formData.get('cantidad') as string
  const observaciones = (formData.get('observaciones') as string)?.trim() || null

  if (!fecha) return { error: 'La fecha es obligatoria.' }

  const cantidad = parseInt(cantidad_raw, 10)
  if (isNaN(cantidad) || cantidad <= 0) {
    return { error: 'La cantidad debe ser un número positivo.' }
  }

  const { error } = await supabase
    .from('mortalidad')
    .insert({ lote_id, fecha, cantidad, observaciones })

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath(`/lotes/${lote_id}`)
  redirect(`/lotes/${lote_id}`)
}

// ─── Pesaje ───────────────────────────────────────────────────────────────────

export async function createPesaje(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lote_id = parseInt(formData.get('lote_id') as string, 10)
  const semana_raw = formData.get('semana') as string
  const peso_raw = formData.get('peso_real_kg') as string

  const semana = parseInt(semana_raw, 10)
  if (isNaN(semana) || semana < 1 || semana > 6) {
    return { error: 'La semana debe estar entre 1 y 6.' }
  }

  const peso_real_kg = parseFloat(peso_raw)
  if (isNaN(peso_real_kg) || peso_real_kg <= 0) {
    return { error: 'El peso debe ser un número positivo.' }
  }

  const { error } = await supabase
    .from('pesajes')
    .insert({ lote_id, semana, peso_real_kg })

  if (error) {
    // Unique constraint (lote_id, semana) gives a specific postgres error
    if (error.code === '23505') {
      return { error: `Ya existe un pesaje para la semana ${semana} de este lote.` }
    }
    return { error: `Error al guardar: ${error.message}` }
  }

  revalidatePath(`/lotes/${lote_id}`)
  redirect(`/lotes/${lote_id}`)
}
