'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type ConfigState = { error: string } | { success: true } | null

export async function upsertConfig(
  _prevState: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  const fields = {
    precio_pollito:            parseFloat(formData.get('precio_pollito') as string),
    precio_alimento_kg:        parseFloat(formData.get('precio_alimento_kg') as string),
    medicina_por_pollo:        parseFloat(formData.get('medicina_por_pollo') as string),
    crianza_entrada_por_pollo: parseFloat(formData.get('crianza_entrada_por_pollo') as string),
    crianza_salida_por_pollo:  parseFloat(formData.get('crianza_salida_por_pollo') as string),
    precio_venta_kg:           parseFloat(formData.get('precio_venta_kg') as string),
  }

  if (Object.values(fields).some((v) => isNaN(v) || v < 0)) {
    return { error: 'Todos los valores deben ser números positivos.' }
  }

  const { data: existing } = await supabase.from('costos_config').select('id').limit(1)
  const existingId = (existing as { id: number }[] | null)?.[0]?.id ?? null

  const { error } = existingId
    ? await supabase.from('costos_config').update(fields).eq('id', existingId)
    : await supabase.from('costos_config').insert(fields)

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath('/configuracion')
  revalidatePath('/')
  return { success: true }
}
