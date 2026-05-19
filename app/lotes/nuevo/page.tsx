import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import NuevoLoteForm from './NuevoLoteForm'

export default function NuevoLotePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">

        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/lotes" className="hover:text-[#1D9E75] transition-colors">Lotes</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Nuevo lote</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Registrar nuevo lote</h1>
          <p className="text-sm text-gray-500 mt-0.5">Completa los datos del nuevo ciclo de producción.</p>
        </div>

        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <NuevoLoteForm />
          </div>
        </div>

      </main>
    </div>
  )
}
