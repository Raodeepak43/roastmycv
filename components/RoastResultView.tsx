'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { RoastFixChecklist } from '@/components/RoastFixChecklist'
import { NumberTicker } from '@/components/ui/be-ui-number-animation'
import { RoastShareBar } from '@/components/roast/RoastShareBar'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import type { IntensityKey, UiStrings } from '@/app/i18n'
import { getScoreLabelKey } from '@/app/i18n'

const SHARE_URL = 'https://www.mycvroast.in'
const SITE_URL = 'www.mycvroast.in'

export interface RoastResultData {
  lines: string[]
  score: number
  intensity: IntensityKey
  language: string
  title?: string
  verdict?: string
  fixes?: string[]
}

const INTENSITY_LABELS: Record<IntensityKey, string> = {
  clean: 'Professional',
  gaali_light: 'Spicy',
  savage: 'Savage',
}

function getScoreColor(score: number) {
  if (score < 4) return '#EF4444'
  if (score <= 6) return '#D97706'
  if (score <= 8) return '#F43C00'
  return '#16A34A'
}

function getScoreRingProgress(score: number) {
  return Math.max(0, Math.min(100, (score / 10) * 100))
}

function getShareText(result: RoastResultData) {
  const verdict = result.verdict || result.lines[result.lines.length - 1]
  return `🔥 Mera resume AI ne roast kiya — ${result.score}/10\n'${verdict}'\n👉 ${SITE_URL}`
}

const INTENSITY_RING: Record<IntensityKey, string> = {
  clean: 'shadow-[0_0_48px_rgba(56,189,198,0.12)]',
  gaali_light: 'shadow-[0_0_48px_rgba(255,69,0,0.18)]',
  savage: 'shadow-[0_0_64px_rgba(220,20,30,0.28)]',
}

function ScoreRing({ score }: { score: number }) {
  const color = getScoreColor(score)
  const progress = getScoreRingProgress(score)
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="roast-result-score-ring" aria-label={`Score ${score} out of 10`}>
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
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="roast-result-score-ring__value" style={{ color }}>
        {score}
        <span className="roast-result-score-ring__max">/10</span>
      </div>
    </div>
  )
}

export interface RoastResultViewProps {
  roastId?: string
  shareToken?: string
  result: RoastResultData
  t: UiStrings
  copied: boolean
  onCopy: () => void
  onReset: () => void
  showTickerNamePrompt?: boolean
  resultNameInput?: string
  onResultNameInput?: (v: string) => void
  onSubmitResultName?: () => void
}

export function RoastResultView({
  roastId,
  shareToken,
  result,
  t,
  copied,
  onCopy,
  onReset,
  showTickerNamePrompt,
  resultNameInput = '',
  onResultNameInput,
  onSubmitResultName,
}: RoastResultViewProps) {
  const [roastExpanded, setRoastExpanded] = useState(false)
  const [savingCard, setSavingCard] = useState(false)
  const shareCardRef = useRef<HTMLElement>(null)
  const isRtl = result.language === 'arabic'
  const title = result.title || result.lines[0] || ''
  const visibleLines = roastExpanded ? result.lines : result.lines.slice(0, 6)
  const fixes = result.fixes ?? t.fixes
  const saveCardLabel = t.result.saveCard ?? 'Download share card'
  const saveCardDoneLabel = t.result.saveCardDone ?? 'Saved'

  const saveCard = useCallback(async () => {
    const node = shareCardRef.current
    if (!node || savingCard) return
    setSavingCard(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#000000',
      })
      const link = document.createElement('a')
      link.download = `mycvroast-${result.score}-10.png`
      link.href = dataUrl
      link.click()
    } catch {
      /* ignore capture failures */
    } finally {
      setTimeout(() => setSavingCard(false), 1200)
    }
  }, [result.score, savingCard])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="roast-result"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Hero score strip */}
      <section className="roast-result-hero">
        <ScoreRing score={result.score} />
        <div className="roast-result-hero__copy">
          <p className="roast-result-hero__label">{t.scoreLabels[getScoreLabelKey(result.score)]}</p>
          <h1 className="roast-result-hero__title">&ldquo;{title}&rdquo;</h1>
          {result.verdict && result.verdict !== title ? (
            <p className="roast-result-hero__verdict">{result.verdict}</p>
          ) : null}
          <div className="roast-result-badges">
            <span className="roast-result-badge roast-result-badge--accent">
              {INTENSITY_LABELS[result.intensity]}
            </span>
            <span className="roast-result-badge">{result.language}</span>
            <span className="roast-result-badge">{result.lines.length} feedback points</span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
        {/* Main content */}
        <div className="lg:col-span-8 space-y-5">
          <article className="roast-result-panel">
            <header className="roast-result-panel__header">
              <h2 className="roast-result-panel__title">{t.result.roast}</h2>
              <span className="roast-result-panel__count">{result.lines.length} items</span>
            </header>
            <div className="roast-result-panel__body">
              {visibleLines.map((line, i) => (
                <div key={i} className="roast-result-line">
                  <span className="roast-result-line__num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="roast-result-line__text">{line}</p>
                </div>
              ))}
              {!roastExpanded && result.lines.length > 6 && (
                <button
                  type="button"
                  onClick={() => setRoastExpanded(true)}
                  className="mt-2 text-sm font-medium text-[var(--color-orange)] hover:underline"
                >
                  {t.result.expand}
                </button>
              )}
            </div>
          </article>

          <article className="roast-result-panel">
            <header className="roast-result-panel__header">
              <h2 className="roast-result-panel__title">{t.result.fixesTitle}</h2>
              <span className="roast-result-panel__count">{fixes.length} fixes</span>
            </header>
            <div className="roast-result-panel__body">
              {fixes.map((fix, i) => (
                <div key={i} className="roast-result-fix">
                  <span className="roast-result-fix__num">{i + 1}</span>
                  <p className="roast-result-fix__text">{fix}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 roast-result-sidebar">
          {shareToken && (
            <RoastShareBar
              variant="light"
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

          {roastId && fixes.length > 0 && (
            <RoastFixChecklist
              roastId={roastId}
              fixes={fixes}
              variant="light"
              title="Mark fixes as you go"
              resumeBuilderHref={`/resume-builder?fromRoast=${encodeURIComponent(roastId)}`}
              roastAgainHref="/"
              resumeBuilderLabel="Fix in Resume Builder"
              roastAgainLabel="Roast updated resume"
              allDoneLabel="Sab fix ho gaya? Updated resume upload karke dubara roast karo."
            />
          )}

          <div className="roast-result-panel">
            <header className="roast-result-panel__header">
              <h2 className="roast-result-panel__title">{t.result.share}</h2>
            </header>
            <div className="roast-result-panel__body space-y-3">
              <div className="rounded-lg border border-[var(--color-border)] bg-[rgba(0,0,0,0.02)] p-3.5 font-body text-[13px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                {getShareText(result)}
              </div>
              <div className="roast-result-actions">
                <button
                  type="button"
                  onClick={onCopy}
                  className="roast-result-btn roast-result-btn--secondary"
                >
                  {copied ? t.result.copied : t.result.copy}
                </button>
                <button
                  type="button"
                  onClick={saveCard}
                  disabled={savingCard}
                  className="roast-result-btn roast-result-btn--secondary"
                >
                  <Download className="size-4" aria-hidden />
                  {savingCard ? saveCardDoneLabel : saveCardLabel}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(result))}`,
                      '_blank',
                    )
                  }
                  className="roast-result-btn roast-result-btn--secondary"
                >
                  Share on X
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
                      '_blank',
                    )
                  }
                  className="roast-result-btn roast-result-btn--secondary"
                >
                  Share on LinkedIn
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showTickerNamePrompt && onResultNameInput && onSubmitResultName && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-5 overflow-hidden roast-result-panel"
          >
            <div className="roast-result-panel__body">
              <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">{t.onboarding.yourName}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={resultNameInput}
                  onChange={(e) => onResultNameInput(e.target.value)}
                  placeholder={t.onboarding.namePlaceholder}
                  maxLength={30}
                  className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 font-body text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--color-orange)]"
                  aria-label={t.onboarding.yourName}
                />
                <button
                  type="button"
                  onClick={onSubmitResultName}
                  className="roast-result-btn roast-result-btn--primary whitespace-nowrap sm:w-auto"
                >
                  Ticker pe dikhao
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="roast-result-footer-actions">
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5">
          <RotateCcw className="size-3.5" aria-hidden />
          {t.tryAgain}
        </button>
        <Link href="/resume-builder" className="inline-flex items-center gap-1.5">
          Fix in Resume Builder
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5">
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to home
        </Link>
      </div>

      {/* Off-screen card for PNG export */}
      <div className="roast-result-export-card" aria-hidden>
        <article
          ref={shareCardRef}
          className={cn(
            'roast-share-card neo-frame neo-frame--orange rounded-none overflow-hidden bg-[#050505] w-[480px]',
            INTENSITY_RING[result.intensity],
          )}
          style={{ textAlign: isRtl ? 'right' : 'left' }}
        >
          <header className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
            <div className="flex items-baseline gap-0.5 shrink-0" style={{ color: getScoreColor(result.score) }}>
              <NumberTicker
                value={result.score}
                startOnView={false}
                duration={0.7}
                blur
                className="font-display text-[3.25rem] leading-none tabular-nums"
                digitClassName="font-display"
                format={(n) => String(n)}
              />
              <span className="font-display text-lg text-muted">/10</span>
            </div>
            <p className="font-body text-[10px] md:text-[11px] leading-snug flex-1 min-w-0 ml-auto text-right text-white/75 uppercase tracking-wide">
              {t.scoreLabels[getScoreLabelKey(result.score)]}
            </p>
          </header>

          <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-orange/[0.07] via-transparent to-transparent">
            <p className="font-display text-[1.15rem] md:text-xl text-white leading-snug">
              &ldquo;{title}&rdquo;
            </p>
            {result.verdict && result.verdict !== title ? (
              <p className="font-body text-[13px] text-white/70 mt-2 leading-relaxed">{result.verdict}</p>
            ) : null}
          </div>

          <section className="px-5 py-4 border-b border-white/10">
            <h2 className="font-body text-[10px] text-orange uppercase tracking-[0.14em] mb-3">{t.result.roast}</h2>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {result.lines.slice(0, 8).map((line, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="mt-[0.45rem] w-1.5 h-1.5 shrink-0 bg-orange" aria-hidden />
                  <p className="font-body text-[13px] text-[#e8e8e8] leading-[1.6] m-0">{line}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="px-5 py-4 border-b border-white/10">
            <h2 className="font-body text-[10px] text-success uppercase tracking-[0.14em] mb-3">
              {t.result.fixesTitle}
            </h2>
            <ol className="space-y-2.5 list-none m-0 p-0">
              {fixes.slice(0, 5).map((fix, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="font-body text-[13px] text-orange shrink-0 w-4 tabular-nums">{i + 1}.</span>
                  <p className="font-body text-[13px] text-white/90 leading-[1.55] m-0">{fix}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="px-5 py-3 bg-black flex items-center justify-between gap-3 border-t border-white/5">
            <span className="font-display text-sm text-white tracking-tight inline-flex items-center">
              <Logo variant="dark" href={false} imageClassName="h-5 w-auto max-w-[100px]" />
            </span>
            <span className="font-body text-[10px] text-dim uppercase tracking-[0.12em]">{SITE_URL}</span>
          </div>
        </article>
      </div>
    </motion.div>
  )
}

export { getShareText }
