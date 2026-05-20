import Navbar from '@/app/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { CostosConfig } from '@/lib/supabase'
import ConfigForm from './ConfigForm'

export const dynamic = 'force-dynamic'

const DEFAULTS: Omit<CostosConfig, 'id' | 'created_at'> = {
  precio_pollito:            1.05,
  precio_alimento_kg:        0.70,
  medicina_por_pollo:        0.05,
  crianza_entrada_por_pollo: 0.13,
  crianza_salida_por_pollo:  0.27,
  precio_venta_kg:           1.20,
}

export default async function ConfiguracionPage() {
  const { data } = await supabase.from('costos_config').select('*').limit(1)
  const config: CostosConfig = ((data as CostosConfig[] | null)?.[0]) ?? ({ id: 0, created_at: '', ...DEFAULTS } as CostosConfig)

  const chips = [
    { label: 'Pollito',       value: `$${config.precio_pollito}/ud` },
    { label: 'Alimento',      value: `$${config.precio_alimento_kg}/kg` },
    { label: 'Medicina',      value: `$${config.medicina_por_pollo}/pollo` },
    { label: 'Crianza entr.', value: `$${config.crianza_entrada_por_pollo}/pollo` },
    { label: 'Crianza sal.',  value: `$${config.crianza_salida_por_pollo}/pollo` },
    { label: 'Precio venta',  value: `$${config.precio_venta_kg}/kg` },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Configuración financiera</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Parámetros de costos y precios usados en proyecciones y resumen financiero
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {chips.map(({ label, value }) => (
            <div key={label} className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-zinc-700/50 shadow-sm px-4 py-2 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{label}: </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{value}</span>
            </div>
          ))}
        </div>

        <div className="max-w-2xl">
          <ConfigForm config={config} />
        </div>

      </main>
    </div>
  )
}
