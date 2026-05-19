'use client'

import { useTransition } from 'react'

export default function DeleteLoteButton({
  action,
  loteName,
}: {
  action: () => Promise<void>
  loteName: string
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(`¿Seguro que quieres borrar "${loteName}" y todos sus datos?\n\nEsta acción no se puede deshacer.`)) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={`Borrar ${loteName}`}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  )
}
