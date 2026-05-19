import { supabase } from './supabase'
import type { Lote, CostosConfig, Venta } from './supabase'

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

export interface VentaCerrada {
  id: number
  loteNombre: string
  fechaVenta: string
  pesoNetoKg: number
  ingresos: number
  costoEstimado: number
  beneficio: number
}

export interface FinancialSummary {
  config: CostosConfig | null
  costoTotalActivos: number
  ingresoProyectado: number
  margenProyectado: number
  margenPct: number
  ventasCerradas: VentaCerrada[]
}

export interface DashboardData {
  lotes: Lote[]
  kpis: DashboardKPIs
  alerts: DashboardAlert[]
  financiero: FinancialSummary
}

type VentaWithLote = Venta & { lotes: { nombre: string; num_pollos: number } | null }

const PESO_SALIDA_KG = 2.60

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)

  // Phase 1: active lotes + config + recent ventas (always needed)
  const [{ data: lotesRaw }, { data: configRaw }, { data: ventasRaw }] = await Promise.all([
    supabase.from('lotes').select('*').eq('estado', 'activo').order('fecha_entrada', { ascending: false }),
    supabase.from('costos_config').select('*').limit(1),
    supabase.from('ventas').select('*, lotes(nombre, num_pollos)').order('created_at', { ascending: false }).limit(8),
  ])

  const lotes = (lotesRaw ?? []) as Lote[]
  const config = ((configRaw as CostosConfig[] | null)?.[0]) ?? null
  const ventas = (ventasRaw ?? []) as VentaWithLote[]
  const loteIds = lotes.map((l) => l.id)

  // Phase 2: lote-dependent queries + closed lote alim for cost calc
  const closedLoteIds = [...new Set(
    ventas.map((v) => v.lote_id).filter((id) => !loteIds.includes(id)),
  )]

  const [loteDependent, alimentacionCerradaData] = await Promise.all([
    (async () => {
      if (loteIds.length === 0) {
        return {
          allMortData:          [] as { cantidad: number }[],
          weekMortData:         [] as { lote_id: number; cantidad: number }[],
          weekFeedData:         [] as { consumo_real_kg: number }[],
          pesajesData:          [] as { lote_id: number; created_at: string }[],
          alimentacionActiva:   [] as { lote_id: number; consumo_real_kg: number }[],
        }
      }
      const [r0, r1, r2, r3, r4] = await Promise.all([
        supabase.from('mortalidad').select('cantidad').in('lote_id', loteIds),
        supabase.from('mortalidad').select('lote_id, cantidad')
          .gte('fecha', sevenDaysAgo.toISOString().split('T')[0])
          .in('lote_id', loteIds),
        supabase.from('alimentacion').select('consumo_real_kg')
          .gte('created_at', sevenDaysAgo.toISOString())
          .in('lote_id', loteIds),
        supabase.from('pesajes').select('lote_id, created_at')
          .in('lote_id', loteIds)
          .order('created_at', { ascending: false }),
        supabase.from('alimentacion').select('lote_id, consumo_real_kg').in('lote_id', loteIds),
      ])
      return {
        allMortData:        (r0.data ?? []) as { cantidad: number }[],
        weekMortData:       (r1.data ?? []) as { lote_id: number; cantidad: number }[],
        weekFeedData:       (r2.data ?? []) as { consumo_real_kg: number }[],
        pesajesData:        (r3.data ?? []) as { lote_id: number; created_at: string }[],
        alimentacionActiva: (r4.data ?? []) as { lote_id: number; consumo_real_kg: number }[],
      }
    })(),
    (async () => {
      if (closedLoteIds.length === 0) return [] as { lote_id: number; consumo_real_kg: number }[]
      const { data } = await supabase.from('alimentacion').select('lote_id, consumo_real_kg').in('lote_id', closedLoteIds)
      return (data ?? []) as { lote_id: number; consumo_real_kg: number }[]
    })(),
  ])

  const { allMortData, weekMortData, weekFeedData, pesajesData, alimentacionActiva } = loteDependent

  // Feed totals per lote (active + closed, for cost calculation)
  const feedByLote: Record<number, number> = {}
  ;[...alimentacionActiva, ...alimentacionCerradaData].forEach((r) => {
    feedByLote[r.lote_id] = (feedByLote[r.lote_id] ?? 0) + r.consumo_real_kg
  })

  // ─── KPI calculations ────────────────────────────────────────────────────────
  const totalPollosBase = lotes.reduce((sum, l) => sum + l.num_pollos, 0)
  const totalMuertos = allMortData.reduce((sum, r) => sum + r.cantidad, 0)
  const polosActivos = Math.max(0, totalPollosBase - totalMuertos)

  const mortSemana = weekMortData.reduce((sum, r) => sum + r.cantidad, 0)
  const mortPct = polosActivos > 0 ? (mortSemana / polosActivos) * 100 : 0
  const alimentacionSemanaKg = weekFeedData.reduce((sum, r) => sum + r.consumo_real_kg, 0)

  // ─── Per-lote lookups for alerts ─────────────────────────────────────────────
  const mortPerLote: Record<number, number> = {}
  weekMortData.forEach((r) => {
    mortPerLote[r.lote_id] = (mortPerLote[r.lote_id] ?? 0) + r.cantidad
  })

  const latestPesajePerLote: Record<number, Date> = {}
  pesajesData.forEach((r) => {
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

    if (daysActive > 35) {
      alerts.push({
        id: `salida-${lote.id}`,
        severity: 'info',
        title: `Próximo a salida — ${lote.nombre}`,
        description: `${lote.nombre} (${lote.nave}) lleva ${daysActive} días activos. Verificar y confirmar fecha de faena.`,
      })
    }
  }

  // ─── Financial summary ────────────────────────────────────────────────────────

  function loteBaseCost(numPollos: number): number {
    if (!config) return 0
    return numPollos * (
      config.precio_pollito +
      config.medicina_por_pollo +
      config.crianza_entrada_por_pollo +
      config.crianza_salida_por_pollo
    )
  }

  let costoTotalActivos = 0
  if (config) {
    for (const lote of lotes) {
      const feedCost = (feedByLote[lote.id] ?? 0) * config.precio_alimento_kg
      costoTotalActivos += loteBaseCost(lote.num_pollos) + feedCost
    }
  }

  const ingresoProyectado = config ? polosActivos * PESO_SALIDA_KG * config.precio_venta_kg : 0
  const margenProyectado = ingresoProyectado - costoTotalActivos
  const margenPct = ingresoProyectado > 0 ? (margenProyectado / ingresoProyectado) * 100 : 0

  const costoPorKg = config && polosActivos > 0
    ? costoTotalActivos / (polosActivos * PESO_SALIDA_KG)
    : 1.08

  const ventasCerradas: VentaCerrada[] = ventas.map((v) => {
    const loteData = v.lotes
    const pesoNetoKg = v.peso_total_kg - v.merma_kg
    const ingresos = pesoNetoKg * v.precio_kg
    const costoEstimado = config && loteData
      ? loteBaseCost(loteData.num_pollos) + (feedByLote[v.lote_id] ?? 0) * config.precio_alimento_kg
      : 0
    return {
      id: v.id,
      loteNombre: loteData?.nombre ?? `Lote #${v.lote_id}`,
      fechaVenta: v.fecha_venta,
      pesoNetoKg,
      ingresos,
      costoEstimado,
      beneficio: ingresos - costoEstimado,
    }
  })

  return {
    lotes,
    kpis: { polosActivos, mortSemana, mortPct, costoPorKg, alimentacionSemanaKg },
    alerts,
    financiero: { config, costoTotalActivos, ingresoProyectado, margenProyectado, margenPct, ventasCerradas },
  }
}
