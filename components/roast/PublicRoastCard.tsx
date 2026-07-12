'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { Logo } from '@/components/Logo'
import {
  INTENSITY_BADGES,
  publicRoastScoreColor,
  type PublicRoastRow,
} from '@/lib/public-roasts'

function PublicScoreRing({ score }: { score: number }) {
  const color = publicRoastScoreColor(score)
  const progress = Math.max(0, Math.min(100, (score / 10) * 100))
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="roast-result-score-ring mx-auto" aria-label={`Score ${score} out of 10`}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="roast-result-score-ring__value" style={{ color }}>
        {score}
        <span className="roast-result-score-ring__max">/10</span>
      </div>
    </div>
  )
}

export function PublicRoastCard({
  roast,
}: {
  roast: Pick<PublicRoastRow, 'score' | 'intensity' | 'language' | 'summary' | 'top_issues'>
}) {
  return (
    <article className="roast-result max-w-2xl mx-auto">
      <header className="roast-result-hero flex-col items-center text-center">
        <Logo variant="light" href="/" className="justify-center mb-2" />
        <p className="roast-result-hero__label">Shared roast result</p>
        <PublicScoreRing score={roast.score} />
        <div className="roast-result-badges justify-center">
          <span className="roast-result-badge roast-result-badge--accent">
            {INTENSITY_BADGES[roast.intensity]}
          </span>
          <span className="roast-result-badge">{roast.language}</span>
        </div>
      </header>

      <div className="mt-6 space-y-5">
        <section className="roast-result-panel">
          <header className="roast-result-panel__header">
            <h2 className="roast-result-panel__title">Top issues</h2>
            <span className="roast-result-panel__count">{roast.top_issues.length} items</span>
          </header>
          <div className="roast-result-panel__body">
            {roast.top_issues.map((issue, i) => (
              <div key={i} className="roast-result-line">
                <span className="roast-result-line__num">{String(i + 1).padStart(2, '0')}</span>
                <p className="roast-result-line__text">{issue}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="roast-result-panel">
          <header className="roast-result-panel__header">
            <h2 className="roast-result-panel__title">Summary</h2>
          </header>
          <div className="roast-result-panel__body">
            <p className="m-0 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
              {roast.summary}
            </p>
          </div>
        </section>

        <Link
          href="/"
          className="roast-result-btn roast-result-btn--primary inline-flex"
        >
          <Flame className="size-4" aria-hidden />
          Roast my CV too — it&apos;s free
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

export function PublicRoastUnavailable() {
  return (
    <div className="roast-result max-w-md mx-auto">
      <div className="roast-result-panel p-10 text-center">
        <p className="text-4xl mb-4" aria-hidden>
          🔒
        </p>
        <h1 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">
          Roast unavailable
        </h1>
        <p className="font-body text-sm text-[var(--text-muted)] mb-6">
          This roast is private or no longer available.
        </p>
        <Link href="/" className="roast-result-btn roast-result-btn--primary inline-flex">
          <Flame className="size-4" aria-hidden />
          Roast my CV — it&apos;s free
        </Link>
      </div>
    </div>
  )
}
