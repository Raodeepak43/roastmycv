'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-page text-center">
      <p className="font-display text-5xl md:text-7xl text-orange mb-4">💀</p>
      <h1 className="font-display text-2xl md:text-3xl text-white mb-3">Kuch toot gaya</h1>
      <p className="font-body text-sm text-muted mb-8 max-w-md">
        Page load fail ho gayi. Dobara try karo ya homepage pe wapas jao.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-roast px-6 py-2.5 text-sm">
          🔥 Dobara try karo
        </button>
        <Link href="/" className="font-body text-sm text-muted hover:text-orange transition-colors">
          Homepage
        </Link>
      </div>
    </main>
  )
}
