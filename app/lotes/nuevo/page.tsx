import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import NuevoLoteForm from './NuevoLoteForm'

export default function NuevoLotePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            <Link href="/lotes" className="hover:text-[#1D9E75] transition-colors">Lotes</Link>
            <span>›</span>
            <span className="text-zinc-700 dark:text-zinc-200 font-medium">Nuevo lote</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Registrar nuevo lote</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Completa los datos del nuevo ciclo de producción.</p>
        </div>

        <div className="max-w-lg">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
            <NuevoLoteForm />
          </div>
        </div>

      </main>
    </div>
  )
}
