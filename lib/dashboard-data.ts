import { supabase } from './supabase'
import type { Lote } from './supabase'

export type AlertSeverity = 'alta' | 'media' | 'info'

export interface DashboardAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
}

export interface DashboardKPIs {
  polosActivos: number
  mortSemana: number
  mortPct: number
  costoPorKg: number
  alimentacionSemanaKg: number
}

export interface DashboardData {
  lotes: Lote[]
  kpis: DashboardKPIs
  alerts: DashboardAlert[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)

  // ─── Active lotes ────────────────────────────────────────────────────────────
  const { data: lotesRaw } = await supabase
    .from('lotes')
    .select('*')
    .eq('estado', 'activo')
    .order('fecha_entrada', { ascending: false })

  const lotes = (lotesRaw ?? []) as Lote[]
  const loteIds = lotes.map((l) => l.id)

  if (loteIds.length === 0) {
    return {
      lotes: [],
      kpis: { polosActivos: 0, mortSemana: 0, mortPct: 0, costoPorKg: 1.08, alimentacionSemanaKg: 0 },
      alerts: [],
    }
  }

  // ─── Parallel queries ────────────────────────────────────────────────────────
  const [allMortRes, weekMortRes, weekFeedRes, pesajesRes] = await Promise.all([
    // Total historical mortality across all active lotes
    supabase.from('mortalidad').select('cantidad').in('lote_id', loteIds),

    // Mortality in last 7 days, per lote (uses fecha — the recorded event date)
    supabase
      .from('mortalidad')
      .select('lote_id, cantidad')
      .gte('fecha', sevenDaysAgo.toISOString().split('T')[0])
      .in('lote_id', loteIds),

    // Feed consumption in last 7 days (uses created_at — when the record was entered)
    supabase
      .from('alimentacion')
      .select('consumo_real_kg')
      .gte('created_at', sevenDaysAgo.toISOString())
      .in('lote_id', loteIds),

    // Latest pesaje date per lote (for yellow alert)
    supabase
      .from('pesajes')
      .select('lote_id, created_at')
      .in('lote_id', loteIds)
      .order('created_at', { ascending: false }),
  ])

  // ─── KPI calculations ────────────────────────────────────────────────────────
  const totalPollosBase = lotes.reduce((sum, l) => sum + l.num_pollos, 0)
  const totalMuertos = ((allMortRes.data ?? []) as { cantidad: number }[])
    .reduce((sum, r) => sum + r.cantidad, 0)
  const polosActivos = Math.max(0, totalPollosBase - totalMuertos)

  const weekMortRows = (weekMortRes.data ?? []) as { lote_id: number; cantidad: number }[]
  const mortSemana = weekMortRows.reduce((sum, r) => sum + r.cantidad, 0)
  const mortPct = polosActivos > 0 ? (mortSemana / polosActivos) * 100 : 0

  const alimentacionSemanaKg = ((weekFeedRes.data ?? []) as { consumo_real_kg: number }[])
    .reduce((sum, r) => sum + r.consumo_real_kg, 0)

  // ─── Per-lote lookups for alerts ─────────────────────────────────────────────
  const mortPerLote: Record<number, number> = {}
  weekMortRows.forEach((r) => {
    mortPerLote[r.lote_id] = (mortPerLote[r.lote_id] ?? 0) + r.cantidad
  })

  // Keep only the most recent pesaje per lote
  const latestPesajePerLote: Record<number, Date> = {}
  ;((pesajesRes.data ?? []) as { lote_id: number; created_at: string }[]).forEach((r) => {
    if (!latestPesajePerLote[r.lote_id]) {
      latestPesajePerLote[r.lote_id] = new Date(r.created_at)
    }
  })

  // ─── Alert generation ────────────────────────────────────────────────────────
  const alerts: DashboardAlert[] = []

  for (const lote of lotes) {
    const daysActive = Math.floor(
      (now.getTime() - new Date(lote.fecha_entrada + 'T00:00:00').getTime()) / 86_400_000,
    )

    // Red — weekly mortality > 5% of this lote's flock
    const loteWeekMort = mortPerLote[lote.id] ?? 0
    if (lote.num_pollos > 0 && loteWeekMort / lote.num_pollos > 0.05) {
      const pct = ((loteWeekMort / lote.num_pollos) * 100).toFixed(1)
      alerts.push({
        id: `mort-${lote.id}`,
        severity: 'alta',
        title: `Mortalidad alta — ${lote.nombre}`,
        description: `${loteWeekMort.toLocaleString('es-ES')} bajas esta semana (${pct}% del lote). Revisar condiciones en ${lote.nave}.`,
      })
    }

    // Yellow — no pesaje registered in last 35 days (only if lote is older than 7 days)
    if (daysActive >= 7) {
      const latest = latestPesajePerLote[lote.id]
      if (!latest || latest < thirtyFiveDaysAgo) {
        alerts.push({
          id: `pesaje-${lote.id}`,
          severity: 'media',
          title: `Sin pesaje reciente — ${lote.nombre}`,
          description: latest
            ? `Último pesaje registrado el ${latest.toLocaleDateString('es-ES')} (hace más de 5 semanas).`
            : `No hay pesajes registrados para este lote.`,
        })
      }
    }

    // Blue — more than 35 days active (approaching slaughter date)
    if (daysActive > 35) {
      alerts.push({
        id: `salida-${lote.id}`,
        severity: 'info',
        title: `Próximo a salida — ${lote.nombre}`,
        description: `${lote.nombre} (${lote.nave}) lleva ${daysActive} días activos. Verificar y confirmar fecha de faena.`,
      })
    }
  }

  return {
    lotes,
    kpis: { polosActivos, mortSemana, mortPct, costoPorKg: 1.08, alimentacionSemanaKg },
    alerts,
  }
}
