'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RoastResultView, getShareText } from '@/components/RoastResultView'
import { PublicRoastCard, PublicRoastUnavailable } from '@/components/roast/PublicRoastCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { buildTickerMessage, mergeTickerItems, PINNED_TICKER_KEY } from '@/lib/ticker'
import { loadRoast, saveRoast, type StoredRoast } from '@/lib/roast-session'
import { savePublicRoastViaApi } from '@/lib/roast/public-save'
import type { PublicRoastRow } from '@/lib/public-roasts'
import { getUi } from '@/app/i18n'
import {
  getConsentedDisplayName,
  setConsentedDisplayName,
} from '@/lib/client-storage/display-name'

type ViewMode = 'loading' | 'owner' | 'public' | 'unavailable'

export default function RoastResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const [roast, setRoast] = useState<StoredRoast | null>(null)
  const [publicRoast, setPublicRoast] = useState<Pick<
    PublicRoastRow,
    'score' | 'intensity' | 'language' | 'summary' | 'top_issues' | 'share_token'
  > | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('loading')
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

    let cancelled = false

    ;(async () => {
      const stored = loadRoast(id)

      if (stored && !cancelled) {
        setRoast(stored)
        setShareToken(stored.shareToken ?? id)
        setShowTickerNamePrompt(Boolean(stored.showTickerNamePrompt))
        setResultNameInput(getConsentedDisplayName())
        setViewMode('owner')

        if (!stored.shareToken) {
          const token = await savePublicRoastViaApi({
            score: stored.score,
            intensity: stored.intensity,
            language: stored.language,
            lines: stored.lines,
            title: stored.title,
            verdict: stored.verdict,
            fixes: stored.fixes,
          })
          if (token && !cancelled) {
            setShareToken(token)
            saveRoast(id, { ...stored, shareToken: token })
          }
        }
        return
      }

      try {
        const res = await fetch(`/api/public-roasts/${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.roast && !cancelled) {
            setPublicRoast(data.roast)
            setViewMode('public')
            return
          }
        }
      } catch {
        /* fall through */
      }

      if (!cancelled) setViewMode('unavailable')
    })()

    return () => {
      cancelled = true
    }
  }, [id, router])

  useEffect(() => {
    const fetchTicker = () => {
      fetch('/api/signups', { cache: 'no-store', credentials: 'include' })
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

  const language = roast?.language ?? publicRoast?.language ?? 'hinglish'
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
      credentials: 'include',
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
    setConsentedDisplayName(name)
    publishRoastToTicker(name, roast.score)
    setShowTickerNamePrompt(false)
  }

  const userTicker = mergeTickerItems(pinnedTicker, tickerNames.slice(0, 4))
  const tickerItems = userTicker

  if (viewMode === 'loading') {
    return (
      <main className="roast-result-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full spinner" />
      </main>
    )
  }

  return (
    <main
      className="roast-result-page elevate-site min-h-screen flex flex-col w-full relative overflow-x-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={language}
    >
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <SiteHeader
          variant="default"
          activePath="home"
          breadcrumb="Roast result"
          tickerItems={viewMode === 'owner' ? tickerItems : undefined}
          pinnedTicker={viewMode === 'owner' ? pinnedTicker : undefined}
        />

        <div className="flex-1 w-full max-w-[90rem] mx-auto px-4 md:px-8 py-6 md:py-10 pb-8">
          {viewMode === 'owner' && roast && (
            <RoastResultView
              roastId={id}
              shareToken={shareToken ?? undefined}
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
          )}

          {viewMode === 'public' && publicRoast && <PublicRoastCard roast={publicRoast} />}

          {viewMode === 'unavailable' && <PublicRoastUnavailable />}
        </div>

        <SiteFooter tagline={t.footer} cinematicInstant />
      </div>
    </main>
  )
}
