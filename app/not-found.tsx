import Link from 'next/link'
import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Page Not Found | MyCVRoast',
  robots: NOINDEX_ROBOTS,
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-page text-center">
      <p className="font-display text-6xl md:text-8xl text-ember mb-4">404</p>
      <h1 className="font-display text-2xl md:text-3xl text-white mb-3">
        Ye page toh roast ho gaya 💀
      </h1>
      <p className="font-body text-sm text-muted mb-8 max-w-md">
        Recruiter ne is URL ko reject kar diya. Wapas homepage pe ja aur apna resume roast karwa.
      </p>
      <Link href="/" className="btn-roast px-8 py-3 text-base">
        🔥 Homepage pe wapas jao
      </Link>
    </main>
  )
}
