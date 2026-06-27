'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { RoastResultView, getShareText } from '@/components/RoastResultView'
import { SiteFooter } from '@/components/SiteFooter'
import { RoastIntensityBackground } from '@/components/ui/roast-intensity-background'
import { buildTickerMessage, mergeTickerItems, PINNED_TICKER_KEY } from '@/lib/ticker'
import { loadRoast, type StoredRoast } from '@/lib/roast-session'
import { getUi } from '@/app/i18n'

const NAME_KEY = 'rcv_display_name'
const TICKER_ITEMS = [
  '⚡ WARNING: HIGH VOLTAGE ROASTS',
  '🔥 ZERO SYMPATHY', '⚡ RECRUITER KI NAZAR', '💀 TERI CV NEXT',
]

export default function RoastResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const [roast, setRoast] = useState<StoredRoast | null>(null)
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTickerNamePrompt, setShowTickerNamePrompt] = useState(false)
  const [resultNameInput, setResultNameInput] = useState('')
  const [tickerNames, setTickerNames] = useState<string[]>([])
  const [pinnedTicker, setPinnedTicker] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      router.replace('/')
      return
    }
    const stored = loadRoast(id)
    if (!stored) {
      router.replace('/')
      return
    }
    setRoast(stored)
    setShowTickerNamePrompt(Boolean(stored.showTickerNamePrompt))
    setResultNameInput(localStorage.getItem(NAME_KEY)?.trim() || '')
    setReady(true)
  }, [id, router])

  useEffect(() => {
    const fetchTicker = () => {
      fetch('/api/signups', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          setTickerNames(d.items ?? [])
          const pinned = sessionStorage.getItem(PINNED_TICKER_KEY)
          if (pinned) setPinnedTicker(pinned)
        })
        .catch(() => {})
    }
    fetchTicker()
    const interval = setInterval(fetchTicker, 15000)
    return () => clearInterval(interval)
  }, [])

  const language = roast?.language ?? 'hinglish'
  const t = getUi(language)
  const isRtl = language === 'arabic'

  const publishRoastToTicker = useCallback((name: string, score?: number, lang?: string) => {
    const roastLang = lang ?? language
    const msg = buildTickerMessage(name, score, roastLang)
    sessionStorage.setItem(PINNED_TICKER_KEY, msg)
    setPinnedTicker(msg)
    fetch('/api/signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, language: roastLang }),
    }).catch(() => {})
  }, [language])

  const copyShare = () => {
    if (!roast) return
    navigator.clipboard.writeText(getShareText(roast))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const submitResultName = () => {
    const name = resultNameInput.trim()
    if (name.length < 2 || !roast) return
    localStorage.setItem(NAME_KEY, name)
    publishRoastToTicker(name, roast.score)
    setShowTickerNamePrompt(false)
  }

  const userTicker = mergeTickerItems(pinnedTicker, tickerNames.slice(0, 4))
  const tickerItems = userTicker.length > 0 ? userTicker : TICKER_ITEMS

  if (!ready || !roast) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full spinner" />
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col w-full relative overflow-x-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={language}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <RoastIntensityBackground intensity={roast.intensity} className="absolute inset-0" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <header className="w-full border-b border-border bg-black/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-body text-[13px] text-[#888888] hover:text-white transition-colors"
            >
              ← {t.tryAgain}
            </Link>
            <Link
              href="/"
              className="font-display text-lg md:text-xl text-white hover:text-orange transition-colors"
            >
              🔥 MyCVRoast
            </Link>
            <Link
              href="/"
              className="font-body text-xs text-orange border border-orange px-3 py-1 rounded-full hover:bg-orange hover:text-black transition-colors"
            >
              {t.roastBtn.replace(/^🔥\s*/, '🔥 ')}
            </Link>
          </div>
          <div className="w-full bg-card/80 backdrop-blur-sm border-t border-border overflow-hidden py-2">
            <div className="ticker-track font-body text-[11px] whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className={`mx-5 inline-flex items-center ${pinnedTicker === item ? 'text-orange font-semibold' : 'text-white'}`}
                >
                  <span className="text-orange mr-1.5">·</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-8">
          <RoastResultView
            result={roast}
            t={t}
            copied={copied}
            onCopy={copyShare}
            onReset={() => router.push('/')}
            showTickerNamePrompt={showTickerNamePrompt}
            resultNameInput={resultNameInput}
            onResultNameInput={setResultNameInput}
            onSubmitResultName={submitResultName}
          />
        </div>

        <SiteFooter tagline={t.footer} support={t.support} cinematicInstant />
      </div>
    </main>
  )
}
