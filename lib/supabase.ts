import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Untyped client — we enforce types at call sites with explicit casts.
// Using the Database generic requires satisfying GenericSchema (including
// Views, Functions, and Relationships fields), which Supabase's code-gen
// handles automatically; hand-written types are error-prone.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Domain types ────────────────────────────────────────────────────────────

export type LoteEstado = 'activo' | 'finalizado' | 'cancelado'

export interface Lote {
  id: number
  nombre: string
  nave: string
  fecha_entrada: string
  num_pollos: number
  semanas_ciclo: number
  estado: LoteEstado
  created_at: string
}

export interface Mortalidad {
  id: number
  lote_id: number
  fecha: string
  cantidad: number
  observaciones: string | null
  created_at: string
}

export interface Pesaje {
  id: number
  lote_id: number
  semana: number
  peso_real_kg: number
  created_at: string
}

export interface Alimentacion {
  id: number
  lote_id: number
  semana: number
  consumo_real_kg: number
  created_at: string
}
