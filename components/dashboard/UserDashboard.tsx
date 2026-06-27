'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flame, LogOut } from 'lucide-react'

interface UserDashboardProps {
  email: string
  name: string
}

export function UserDashboard({ email, name }: UserDashboardProps) {
  const router = useRouter()

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-page text-white">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg hover:text-orange transition-colors flex items-center gap-2">
            <Flame className="size-5 text-orange" aria-hidden />
            MyCVRoast
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="font-body text-[11px] text-dim hover:text-orange transition-colors flex items-center gap-1.5"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Your dashboard</h1>
        <p className="font-body text-dim text-sm mb-8">
          Signed in as <span className="text-white">{name || email}</span>
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/"
            className="block p-5 rounded-card border border-border bg-card hover:border-orange/50 transition-colors"
          >
            <h2 className="font-display text-lg mb-1">Roast my CV</h2>
            <p className="font-body text-[12px] text-dim">
              Upload your resume and get brutal AI feedback.
            </p>
          </Link>
          <Link
            href="/resume-builder"
            className="block p-5 rounded-card border border-border bg-card hover:border-orange/50 transition-colors"
          >
            <h2 className="font-display text-lg mb-1">Resume Builder</h2>
            <p className="font-body text-[12px] text-dim">
              Build an ATS-friendly resume with live preview.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
