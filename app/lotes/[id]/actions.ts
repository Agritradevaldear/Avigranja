'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { error: string } | null

// ─── Delete records ───────────────────────────────────────────────────────────

export async function deleteMortalidad(id: number, loteId: number): Promise<void> {
  await supabase.from('mortalidad').delete().eq('id', id)
  revalidatePath(`/lotes/${loteId}`)
}

export async function deletePesaje(id: number, loteId: number): Promise<void> {
  await supabase.from('pesajes').delete().eq('id', id)
  revalidatePath(`/lotes/${loteId}`)
}

export async function deleteAlimentacion(id: number, loteId: number): Promise<void> {
  await supabase.from('alimentacion').delete().eq('id', id)
  revalidatePath(`/lotes/${loteId}`)
}

export async function deleteGasto(id: number, loteId: number): Promise<void> {
  await supabase.from('gastos_lote').delete().eq('id', id)
  revalidatePath(`/lotes/${loteId}`)
}

// ─── Gastos ───────────────────────────────────────────────────────────────────

const CATEGORIAS = ['Pienso', 'Medicina', 'Crianza', 'Concha de arroz', 'Otros'] as const

export async function createGasto(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lote_id     = parseInt(formData.get('lote_id') as string, 10)
  const categoria   = (formData.get('categoria') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const importe     = parseFloat(formData.get('importe') as string)
  const fecha       = (formData.get('fecha') as string)?.trim()

  if (!CATEGORIAS.includes(categoria as typeof CATEGORIAS[number])) {
    return { error: 'Categoría no válida.' }
  }
  if (!fecha) return { error: 'La fecha es obligatoria.' }
  if (isNaN(importe) || importe <= 0) return { error: 'El importe debe ser un número positivo.' }

  const { error } = await supabase
    .from('gastos_lote')
    .insert({ lote_id, categoria, descripcion, importe, fecha })

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath(`/lotes/${lote_id}`)
  redirect(`/lotes/${lote_id}`)
}

// ─── Venta ────────────────────────────────────────────────────────────────────

export async function createVenta(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lote_id      = parseInt(formData.get('lote_id') as string, 10)
  const fecha_venta  = (formData.get('fecha_venta') as string)?.trim()
  const peso_total_kg = parseFloat(formData.get('peso_total_kg') as string)
  const precio_kg    = parseFloat(formData.get('precio_kg') as string)
  const merma_kg     = parseFloat(formData.get('merma_kg') as string) || 0
  const comprador    = (formData.get('comprador') as string)?.trim() || null

  if (!fecha_venta) return { error: 'La fecha de venta es obligatoria.' }
  if (isNaN(peso_total_kg) || peso_total_kg <= 0) return { error: 'El peso total debe ser un número positivo.' }
  if (isNaN(precio_kg) || precio_kg <= 0) return { error: 'El precio por kg debe ser un número positivo.' }
  if (merma_kg < 0) return { error: 'La merma no puede ser negativa.' }

  const { error: ventaError } = await supabase
    .from('ventas')
    .insert({ lote_id, fecha_venta, peso_total_kg, precio_kg, merma_kg, comprador })

  if (ventaError) return { error: `Error al registrar la venta: ${ventaError.message}` }

  await supabase.from('lotes').update({ estado: 'finalizado' }).eq('id', lote_id)

  revalidatePath(`/lotes/${lote_id}`)
  revalidatePath('/lotes')
  revalidatePath('/')
  redirect(`/lotes/${lote_id}`)
}

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

// ─── Alimentación ────────────────────────────────────────────────────────────

export async function createAlimentacion(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lote_id = parseInt(formData.get('lote_id') as string, 10)
  const semana_raw = formData.get('semana') as string
  const consumo_raw = formData.get('consumo_real_kg') as string

  const semana = parseInt(semana_raw, 10)
  if (isNaN(semana) || semana < 1 || semana > 6) {
    return { error: 'La semana debe estar entre 1 y 6.' }
  }

  const consumo_real_kg = parseFloat(consumo_raw)
  if (isNaN(consumo_real_kg) || consumo_real_kg <= 0) {
    return { error: 'El consumo debe ser un número positivo.' }
  }

  const { error } = await supabase
    .from('alimentacion')
    .insert({ lote_id, semana, consumo_real_kg })

  if (error) {
    if (error.code === '23505') {
      return { error: `Ya existe un registro de alimentación para la semana ${semana} de este lote.` }
    }
    return { error: `Error al guardar: ${error.message}` }
  }

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
