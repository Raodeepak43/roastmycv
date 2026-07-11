'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import {
  INTENSITY_BADGES,
  publicRoastScoreColor,
  type PublicRoastRow,
} from '@/lib/public-roasts'

export function PublicRoastCard({ roast }: { roast: Pick<PublicRoastRow, 'score' | 'intensity' | 'language' | 'summary' | 'top_issues'> }) {
  const scoreColor = publicRoastScoreColor(roast.score)

  return (
    <article className="neo-frame neo-frame--orange w-full max-w-[480px] mx-auto bg-[#0a0a0a] border border-white/10 overflow-hidden">
      <header className="px-6 pt-8 pb-5 text-center border-b border-white/10">
        <Logo variant="dark" href="/" className="justify-center" />
        <h1 className="font-display text-lg text-orange mt-3 tracking-wide uppercase">
          💀 Roast Result
        </h1>
      </header>

      <div className="px-6 py-8 text-center border-b border-white/10">
        <p
          className="font-display text-6xl md:text-7xl tabular-nums leading-none"
          style={{ color: scoreColor }}
        >
          {roast.score}
          <span className="text-2xl text-white/40"> / 10</span>
        </p>
      </div>

      <div className="px-6 py-4 flex flex-wrap gap-2 justify-center border-b border-white/10">
        <span className="font-body text-xs px-3 py-1 border border-white/20 text-white/80 uppercase tracking-wider">
          {INTENSITY_BADGES[roast.intensity]}
        </span>
        <span className="font-body text-xs px-3 py-1 border border-orange/40 text-orange uppercase tracking-wider">
          {roast.language}
        </span>
      </div>

      <section className="px-6 py-5 border-b border-white/10">
        <h2 className="font-body text-[10px] text-orange uppercase tracking-[0.14em] mb-3">
          Top issues
        </h2>
        <ul className="space-y-2 list-none m-0 p-0">
          {roast.top_issues.map((issue, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-orange shrink-0" aria-hidden>•</span>
              <p className="font-body text-sm text-white/85 leading-relaxed m-0">{issue}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-5 border-b border-white/10">
        <p className="font-body text-sm text-white/75 leading-relaxed m-0">{roast.summary}</p>
      </section>

      <div className="px-6 py-6">
        <Link
          href="/"
          className="block w-full text-center font-body text-sm py-3 px-4 bg-orange text-black font-semibold hover:bg-orange/90 transition-colors"
        >
          🔥 Roast my CV too — it&apos;s free
        </Link>
      </div>
    </article>
  )
}

export function PublicRoastUnavailable() {
  return (
    <div className="neo-frame neo-frame--orange w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/10 p-10 text-center">
      <p className="text-4xl mb-4" aria-hidden>🔒</p>
      <h1 className="font-display text-xl text-white mb-2">Roast unavailable</h1>
      <p className="font-body text-sm text-white/60 mb-6">
        This roast is private or no longer available.
      </p>
      <Link
        href="/"
        className="inline-block font-body text-sm py-3 px-6 bg-orange text-black font-semibold hover:bg-orange/90 transition-colors"
      >
        🔥 Roast my CV — it&apos;s free
      </Link>
    </div>
  )
}
