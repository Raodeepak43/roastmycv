'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

function getScoreEmoji(score: number) {
  if (score <= 3) return '💀'
  if (score <= 5) return '😬'
  if (score <= 7) return '😐'
  if (score <= 9) return '😎'
  return '🏆'
}

function getScoreColor(score: number) {
  if (score < 4) return '#EF4444'
  if (score <= 6) return '#F5C542'
  if (score <= 8) return '#FF4500'
  return '#22C55E'
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

function ShareButtons({
  result,
  copied,
  onCopy,
  onSaveCard,
  savingCard,
  copyLabel,
  copiedLabel,
  saveCardLabel,
  saveCardDoneLabel,
}: {
  result: RoastResultData
  copied: boolean
  onCopy: () => void
  onSaveCard: () => void
  savingCard: boolean
  copyLabel: string
  copiedLabel: string
  saveCardLabel: string
  saveCardDoneLabel: string
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        type="button"
        onClick={onSaveCard}
        disabled={savingCard}
        className="font-body text-[13px] py-2.5 rounded-xl border border-orange/60 bg-orange/10 text-orange hover:bg-orange/20 transition-colors disabled:opacity-60"
      >
        {savingCard ? saveCardDoneLabel : saveCardLabel}
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="font-body text-[13px] py-2.5 rounded-xl border border-border bg-black/40 text-white hover:border-orange hover:text-orange transition-colors"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
            '_blank',
          )
        }
        className="font-body text-[13px] py-2.5 rounded-xl border border-[#0077B5]/60 bg-black/40 text-[#0077B5] hover:bg-[#0077B5]/10 transition-colors"
      >
        💼 LinkedIn
      </button>
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(result))}`,
            '_blank',
          )
        }
        className="font-body text-[13px] py-2.5 rounded-xl border border-[#1DA1F2]/60 bg-black/40 text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors"
      >
        🐦 Twitter
      </button>
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
  const visibleLines = roastExpanded ? result.lines : result.lines.slice(0, 5)
  const fixes = result.fixes ?? t.fixes
  const saveCardLabel = t.result.saveCard ?? '📸 Save card'
  const saveCardDoneLabel = t.result.saveCardDone ?? '✅ Saved'

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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[520px] mx-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Shareable screenshot card */}
      <article
        ref={shareCardRef}
        className={cn(
          'roast-share-card neo-frame neo-frame--orange rounded-none overflow-hidden bg-[#050505]',
          INTENSITY_RING[result.intensity],
        )}
        style={{ textAlign: isRtl ? 'right' : 'left' }}
      >
        <header className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
          <span className="text-[2.5rem] leading-none shrink-0" aria-hidden>
            {getScoreEmoji(result.score)}
          </span>
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
            <p className="font-body text-[13px] text-white/70 mt-2 leading-relaxed">
              {result.verdict}
            </p>
          ) : null}
        </div>

        <section className="px-5 py-4 border-b border-white/10">
          <h2 className="font-body text-[10px] text-orange uppercase tracking-[0.14em] mb-3">
            {t.result.roast}
          </h2>
          <ul className="space-y-2.5 list-none m-0 p-0">
            {visibleLines.map((line, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="mt-[0.45rem] w-1.5 h-1.5 shrink-0 bg-orange" aria-hidden />
                <p className="font-body text-[13px] md:text-[14px] text-[#e8e8e8] leading-[1.6] m-0">
                  {line}
                </p>
              </li>
            ))}
          </ul>
          {!roastExpanded && result.lines.length > 5 && (
            <button
              type="button"
              onClick={() => setRoastExpanded(true)}
              className="font-body text-[13px] text-orange mt-3 hover:text-white transition-colors"
            >
              {t.result.expand}
            </button>
          )}
        </section>

        <section className="px-5 py-4 border-b border-white/10">
          <h2 className="font-body text-[10px] text-success uppercase tracking-[0.14em] mb-3">
            {t.result.fixesTitle}
          </h2>
          <ol className="space-y-2.5 list-none m-0 p-0">
            {fixes.map((fix, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="font-body text-[13px] text-orange shrink-0 w-4 tabular-nums">{i + 1}.</span>
                <p className="font-body text-[13px] md:text-[14px] text-white/90 leading-[1.55] m-0">{fix}</p>
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

      {shareToken && (
        <div className="mt-5">
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
        </div>
      )}

      {roastId && fixes.length > 0 && (
        <div className="mt-5">
          <RoastFixChecklist
            roastId={roastId}
            fixes={fixes}
            variant="dark"
            title="Mark fixes as you go"
                  resumeBuilderHref={`/resume-builder?fromRoast=${encodeURIComponent(roastId)}`}
            roastAgainHref="/"
            resumeBuilderLabel="Fix in Resume Builder"
            roastAgainLabel="Roast updated resume"
            allDoneLabel="Sab fix ho gaya? Updated resume upload karke dubara roast karo."
          />
        </div>
      )}

      {/* Actions — outside the share card */}
      <div className="mt-5 space-y-4">
        <AnimatePresence>
          {showTickerNamePrompt && onResultNameInput && onSubmitResultName && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border border-border bg-[#0a0a0a] px-4 py-4"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={resultNameInput}
                  onChange={(e) => onResultNameInput(e.target.value)}
                  placeholder={t.onboarding.namePlaceholder}
                  maxLength={30}
                  className="flex-1 bg-black/60 border border-border rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder:text-dim focus:border-orange outline-none"
                  aria-label={t.onboarding.yourName}
                />
                <button
                  type="button"
                  onClick={onSubmitResultName}
                  className="btn-roast px-4 py-2.5 text-sm whitespace-nowrap"
                >
                  Ticker pe dikhao 🔥
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3 px-1">
          <h2 className="font-body text-[11px] text-muted uppercase tracking-[0.12em]">
            {t.result.share}
          </h2>
          <div className="rounded-xl border border-border bg-black/50 p-4 font-body text-[13px] text-[#ccc] whitespace-pre-wrap leading-[1.5]">
            {getShareText(result)}
          </div>
          <ShareButtons
            result={result}
            copied={copied}
            onCopy={onCopy}
            onSaveCard={saveCard}
            savingCard={savingCard}
            copyLabel={t.result.copy}
            copiedLabel={t.result.copied}
            saveCardLabel={saveCardLabel}
            saveCardDoneLabel={saveCardDoneLabel}
          />
          <button
            type="button"
            onClick={onReset}
            className="w-full font-body text-[13px] text-dim hover:text-white py-2 transition-colors"
          >
            ↩ {t.tryAgain}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export { getShareText }
