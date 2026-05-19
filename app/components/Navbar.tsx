'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Lotes', href: '/lotes' },
  { label: 'Configuración', href: '/configuracion' },
]

export default function Navbar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-[#1D9E75] text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9 2 7 4 7 6c0 1.5.8 2.8 2 3.5V11H6l-2 4h16l-2-4h-3V9.5c1.2-.7 2-2 2-3.5 0-2-2-4-5-4z" fill="#1D9E75"/>
            <path d="M5 15v5a1 1 0 001 1h12a1 1 0 001-1v-5H5z" fill="#1D9E75"/>
            <circle cx="10" cy="6" r="1" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">AviGranja</span>
      </Link>
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-white/25 text-white'
                : 'hover:bg-white/15 text-white/90'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
