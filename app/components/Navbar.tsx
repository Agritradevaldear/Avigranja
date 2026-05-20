'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Lotes', href: '/lotes' },
  { label: 'Configuración', href: '/configuracion' },
]

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      className="p-2 rounded-lg text-[#1D9E75] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default function Navbar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9 2 7 4 7 6c0 1.5.8 2.8 2 3.5V11H6l-2 4h16l-2-4h-3V9.5c1.2-.7 2-2 2-3.5 0-2-2-4-5-4z" fill="white"/>
              <path d="M5 15v5a1 1 0 001 1h12a1 1 0 001-1v-5H5z" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-[#1D9E75] tracking-tight">AviGranja</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-zinc-200 dark:border-zinc-700">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
