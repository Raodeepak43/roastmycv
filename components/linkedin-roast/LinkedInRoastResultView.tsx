'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { NumberTicker } from '@/components/ui/be-ui-number-animation'
import { RoastShareBar } from '@/components/roast/RoastShareBar'
import type { IntensityKey } from '@/app/i18n'
import type { LinkedInSectionScores } from '@/lib/linkedin-roast/generate'

export type LinkedInRoastDisplay = {
  score: number
  sectionScores: LinkedInSectionScores
  lines: string[]
  title?: string
  verdict?: string
  fixes?: string[]
  intensity: IntensityKey
  language: string
}

const SECTION_LABELS: Record<keyof LinkedInSectionScores, string> = {
  headline: 'Headline',
  about: 'About',
  experience: 'Experience',
  skills: 'Skills',
  activity: 'Activity',
}

function scoreColor(score: number) {
  if (score < 4) return '#EF4444'
  if (score <= 6) return '#F5C542'
  if (score <= 8) return '#FF4500'
  return '#22C55E'
}

export function LinkedInRoastResultView({
  result,
  shareToken,
  onReset,
}: {
  result: LinkedInRoastDisplay
  shareToken?: string
  onReset: () => void
}) {
  const title = result.title || result.lines[0] || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[520px] mx-auto space-y-5"
    >
      <article className="roast-share-card neo-frame neo-frame--orange rounded-none overflow-hidden bg-[#050505]">
        <header className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
          <span className="text-[2.5rem] leading-none">💼</span>
          <div className="flex items-baseline gap-0.5" style={{ color: scoreColor(result.score) }}>
            <NumberTicker value={result.score} startOnView={false} duration={0.7} blur className="font-display text-[3.25rem] leading-none tabular-nums" format={(n) => String(n)} />
            <span className="font-display text-lg text-muted">/10</span>
          </div>
          <p className="font-body text-[10px] text-white/75 ml-auto text-right uppercase tracking-wide">LinkedIn Score</p>
        </header>

        <div className="px-5 py-4 border-b border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(result.sectionScores) as [keyof LinkedInSectionScores, number][]).map(([key, val]) => (
            <div key={key} className="border border-white/10 px-2 py-2 text-center">
              <p className="font-body text-[9px] text-muted uppercase tracking-wider">{SECTION_LABELS[key]}</p>
              <p className="font-display text-lg tabular-nums" style={{ color: scoreColor(val) }}>{val}/10</p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-orange/[0.07] via-transparent to-transparent">
          <p className="font-display text-[1.15rem] text-white leading-snug">&ldquo;{title}&rdquo;</p>
          {result.verdict && <p className="font-body text-[13px] text-white/70 mt-2">{result.verdict}</p>}
        </div>

        <section className="px-5 py-4 border-b border-white/10">
          <h2 className="font-body text-[10px] text-orange uppercase tracking-[0.14em] mb-3">The roast</h2>
          <ul className="space-y-2.5 list-none m-0 p-0">
            {result.lines.slice(0, 8).map((line, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="mt-[0.45rem] w-1.5 h-1.5 shrink-0 bg-orange" />
                <p className="font-body text-[13px] text-[#e8e8e8] leading-[1.6] m-0">{line}</p>
              </li>
            ))}
          </ul>
        </section>

        {result.fixes && result.fixes.length > 0 && (
          <section className="px-5 py-4 border-b border-white/10">
            <h2 className="font-body text-[10px] text-success uppercase tracking-[0.14em] mb-3">Top 3 fixes</h2>
            <ol className="space-y-2 list-none m-0 p-0">
              {result.fixes.map((fix, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="font-body text-[13px] text-orange shrink-0">{i + 1}.</span>
                  <p className="font-body text-[13px] text-white/90 m-0">{fix}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="px-5 py-3 bg-black flex items-center justify-between border-t border-white/5">
          <span className="font-display text-sm text-white">💼 LinkedIn Roast</span>
          <span className="font-body text-[10px] text-dim uppercase">mycvroast.in</span>
        </div>
      </article>

      {shareToken && (
        <RoastShareBar
          shareToken={shareToken}
          score={result.score}
          language={result.language}
          intensity={result.intensity}
          lines={result.lines}
          title={result.title}
          verdict={result.verdict}
          fixes={result.fixes}
        />
      )}

      <div className="dash-tools-card p-4 text-center space-y-3">
        <p className="font-body text-sm text-[#ccc]">Ready to fix your LinkedIn?</p>
        <Link href="/dashboard/tools/linkedin" className="dash-tools-btn inline-flex text-sm">
          Fix your LinkedIn → Summary Writer
        </Link>
      </div>

      <button type="button" onClick={onReset} className="w-full font-body text-[13px] text-dim hover:text-white py-2">
        ↩ Roast another profile
      </button>
    </motion.div>
  )
}
