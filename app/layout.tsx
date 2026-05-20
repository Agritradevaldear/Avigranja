import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'AviGranja — Gestión de Granja',
  description: 'Dashboard de gestión para granja de pollos de engorde',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
