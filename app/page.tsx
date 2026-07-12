'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { PricingPlans } from '@/components/PricingPlans'
import { WhatWeOffer } from '@/components/WhatWeOffer'
import { CareerToolsSection } from '@/components/home/CareerToolsSection'
import { RazorpayProButton } from '@/components/RazorpayProButton'
import { HighVoltageBadge, SectionHeading } from '@/components/UiChrome'
import { AnimatePresence, MotionFadeUp, MotionStagger, MotionStaggerItem, motion } from '@/components/Motion'
import { NumberTicker } from '@/components/ui/be-ui-number-animation'
import { buildTickerMessage, mergeTickerItems, PINNED_TICKER_KEY } from '@/lib/ticker'
import { fetchGuestUsage } from '@/lib/usage/client'
import { FREE_LIMIT } from '@/lib/usage'
import { ACCOUNT_DELETED_TOAST_KEY } from '@/lib/dashboard/constants'
import { homeFaqPageJsonLd } from '@/lib/schema'
import { createRoastId, saveRoast } from '@/lib/roast-session'
import { savePublicRoastViaApi } from '@/lib/roast/public-save'
import { RecentRoastsFeed } from '@/components/home/RecentRoastsFeed'
import { ElevateMarquee } from '@/components/home/ElevateMarquee'
import { HomePracticalCtas } from '@/components/home/HomePracticalCtas'
import { HomeLongTailSection } from '@/components/home/HomeLongTailSection'
import { Reveal } from '@/components/ui/Reveal'
import { TrustBar } from '@/components/home/TrustBar'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import {
  clearDisplayNameOnSkip,
  getConsentedDisplayName,
  setConsentedDisplayName,
} from '@/lib/client-storage/display-name'
import { getUi, type IntensityKey, type UiStrings } from './i18n'

const SITE_URL = 'www.mycvroast.in'
const SHARE_URL = 'https://www.mycvroast.in'
const LANGUAGE_KEY = 'rcv_language'
const ONBOARD_KEY = 'rcv_onboarded'
/** @deprecated removed — clear on load */
const LEGACY_STATS_FLOOR_KEY = 'rcv_stats_floor'

function parseStatCount(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return Math.max(0, v)
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    if (!Number.isNaN(n)) return Math.max(0, n)
  }
  return 0
}

function detectBrowserLanguage(): string {
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase()
  if (lang.startsWith('hi')) return 'hinglish'
  if (lang.startsWith('en')) return 'english'
  if (lang.startsWith('es')) return 'spanish'
  if (lang.startsWith('pt')) return 'portuguese'
  if (lang.startsWith('fr')) return 'french'
  if (lang.startsWith('de')) return 'german'
  if (lang.startsWith('ar')) return 'arabic'
  if (lang.startsWith('ja')) return 'japanese'
  if (lang.startsWith('ko')) return 'korean'
  if (lang.startsWith('ru')) return 'russian'
  if (lang.startsWith('zh')) return 'chinese'
  if (lang.startsWith('tr')) return 'turkish'
  if (lang.startsWith('id')) return 'indonesian'
  if (lang.startsWith('it')) return 'italian'
  if (lang.startsWith('nl')) return 'dutch'
  return 'english'
}

const LOADING_MSGS_FALLBACK = ['📖 ...', '🔍 ...', '💀 ...', '⚡ ...']

const INTENSITY_IDS: IntensityKey[] = ['clean', 'gaali_light', 'savage']

const LANGUAGES = [
  { code: 'hinglish', flag: '🇮🇳', name: 'Hinglish' },
  { code: 'english', flag: '🇺🇸', name: 'English' },
  { code: 'spanish', flag: '🇪🇸', name: 'Spanish' },
  { code: 'portuguese', flag: '🇧🇷', name: 'Português' },
  { code: 'french', flag: '🇫🇷', name: 'Français' },
  { code: 'german', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'arabic', flag: '🇸🇦', name: 'العربية' },
  { code: 'japanese', flag: '🇯🇵', name: '日本語' },
  { code: 'korean', flag: '🇰🇷', name: '한국어' },
  { code: 'russian', flag: '🇷🇺', name: 'Русский' },
  { code: 'chinese', flag: '🇨🇳', name: '中文' },
  { code: 'turkish', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'indonesian', flag: '🇮🇩', name: 'Indonesia' },
  { code: 'italian', flag: '🇮🇹', name: 'Italiano' },
  { code: 'dutch', flag: '🇳🇱', name: 'Nederlands' },
]

type Intensity = IntensityKey

function HowItWorksIcon({ index }: { index: number }) {
  const cls = 'w-7 h-7 text-white shrink-0'
  if (index === 0) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" strokeLinecap="round" />
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h2v2H9V9zm4 0h2v2h-2V9zM9 13h2v2H9v-2zm4 0h2v2h-2v-2z" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3c-1.5 2.5-4 4.5-4 8a4 4 0 108 0c0-3.5-2.5-5.5-4-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

async function fetchJson<T>(url: string, options?: RequestInit, fallbackError = 'Something went wrong'): Promise<T> {
  const res = await fetch(url, options)
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error(fallbackError)
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? fallbackError)
  return data as T
}

function parseRoastLines(buffer: string): string[] {
  const cleaned = buffer.replace(/```[\s\S]*?```/g, '').trim()
  const numbered = Array.from(cleaned.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*(.+)/g))
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10))
    .map((m) => m[2].trim())
    .filter(Boolean)
  if (numbered.length > 0) return numbered
  return cleaned.split('\n').map((l) => l.replace(/^\s*\d{1,2}\.\s*/, '').trim()).filter((l) => l.length > 10)
}

interface RoastApiResponse {
  score: number
  title: string
  roast: string
  verdict: string
  fixes: string[]
  statsCount?: number
  usesLeft?: number
}

async function fetchRoast(resumeText: string, intensity: Intensity, language: string, fp: string, incompleteError: string) {
  const data = await fetchJson<RoastApiResponse>('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ resumeText, intensity, language, fp }),
  }, incompleteError)
  const lines = parseRoastLines(data.roast)
  if (lines.length < 6) throw new Error(incompleteError)
  return {
    lines: lines.slice(0, 12),
    score: data.score,
    title: data.title,
    verdict: data.verdict,
    fixes: data.fixes?.length ? data.fixes : undefined,
    language,
    statsCount: data.statsCount,
    usesLeft: data.usesLeft,
  }
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f43c00" strokeWidth="1.5" className="mx-auto mb-3">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function LanguagePicker({ language, onSelect, compact, scrollHint }: { language: string; onSelect: (code: string) => void; compact?: boolean; scrollHint?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [needsScroll, setNeedsScroll] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || compact) return
    const mq = window.matchMedia('(max-width: 767px)')
    const check = () => {
      if (!mq.matches) {
        setNeedsScroll(false)
        return
      }
      setNeedsScroll(el.scrollWidth > el.clientWidth + 2)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    mq.addEventListener('change', check)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', check)
    }
  }, [compact])

  return (
    <div>
      <div
        ref={scrollRef}
        className={`${compact ? 'flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 justify-center' : 'lang-scroll flex gap-2 flex-nowrap md:flex-wrap justify-start md:justify-center pb-1'}`}
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            aria-pressed={language === lang.code}
            aria-label={`Roast language: ${lang.name}`}
            className={`font-body text-xs py-1.5 px-3 rounded-full border whitespace-nowrap transition-all shrink-0 ${
              language === lang.code
                ? 'bg-orange border-orange text-black'
                : 'bg-card border-border text-dim'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
      {!compact && scrollHint && needsScroll && (
        <p className="font-body text-[10px] text-muted text-center mt-1.5">{scrollHint}</p>
      )}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingLang, setLoadingLang] = useState<string | null>(null)
  const [loadMsgIdx, setLoadMsgIdx] = useState(0)
  const [error, setError] = useState('')
  const [intensity, setIntensity] = useState<Intensity>('gaali_light')
  const [language, setLanguage] = useState('hinglish')
  const [roastCount, setRoastCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [usesLeft, setUsesLeft] = useState(FREE_LIMIT)
  const [fp, setFp] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [uploadHighlight, setUploadHighlight] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardStep, setOnboardStep] = useState<1 | 2>(1)
  const [onboardName, setOnboardName] = useState('')
  const [onboardError, setOnboardError] = useState('')
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [captureEmail, setCaptureEmail] = useState('')
  const [captureError, setCaptureError] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureSuccess, setCaptureSuccess] = useState(false)
  const [tickerNames, setTickerNames] = useState<string[]>([])
  const [pinnedTicker, setPinnedTicker] = useState<string | null>(null)
  const [accountDeletedToast, setAccountDeletedToast] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const roastSectionRef = useRef<HTMLDivElement>(null)

  const t = getUi(language)
  const loadingT = getUi(loadingLang ?? language)
  const isRtl = language === 'arabic'

  const selectLanguage = (code: string) => {
    setLanguage(code)
    localStorage.setItem(LANGUAGE_KEY, code)
  }

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STATS_FLOOR_KEY)
    } catch {
      /* ignore */
    }

    const savedName = getConsentedDisplayName()
    const urlLang = new URLSearchParams(window.location.search).get('lang')
    const savedLang = localStorage.getItem(LANGUAGE_KEY)
    const validUrlLang = urlLang && LANGUAGES.some((l) => l.code === urlLang) ? urlLang : null
    const onboarded = localStorage.getItem(ONBOARD_KEY)

    setOnboardName(savedName)
    setLanguage(validUrlLang || savedLang || detectBrowserLanguage())
    if (validUrlLang) localStorage.setItem(LANGUAGE_KEY, validUrlLang)

    const savedPinned = sessionStorage.getItem(PINNED_TICKER_KEY)
    if (savedPinned) setPinnedTicker(savedPinned)

    if (!onboarded) setShowOnboarding(true)

    if (sessionStorage.getItem(ACCOUNT_DELETED_TOAST_KEY) === '1') {
      sessionStorage.removeItem(ACCOUNT_DELETED_TOAST_KEY)
      setAccountDeletedToast(true)
      window.setTimeout(() => setAccountDeletedToast(false), 5000)
    }

    const loadUsage = async (visitorId?: string) => {
      try {
        const data = await fetchGuestUsage(visitorId)
        setUsesLeft(data.usesLeft)
      } catch {
        setUsesLeft(FREE_LIMIT)
      }
    }

    const loadFingerprint = async () => {
      try {
        const fpAgent = await FingerprintJS.load()
        const result = await fpAgent.get()
        const visitorId = result.visitorId
        setFp(visitorId)
        await loadUsage(visitorId)
      } catch {
        await loadUsage()
      }
    }
    loadFingerprint()

    const fetchStats = () => {
      fetch('/api/stats', { cache: 'no-store', credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          setRoastCount(parseStatCount(d.count))
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false))
    }
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
    fetchStats()
    fetchTicker()
    const interval = setInterval(() => {
      fetchStats()
      fetchTicker()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const publishRoastToTicker = useCallback((name: string, score?: number, lang?: string) => {
    const roastLang = lang ?? language
    const msg = buildTickerMessage(name, score, roastLang)
    sessionStorage.setItem(PINNED_TICKER_KEY, msg)
    setPinnedTicker(msg)
    setTickerNames((prev) => mergeTickerItems(msg, prev).slice(0, 4))
    fetch('/api/signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, score, language: roastLang }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length) {
          setTickerNames(d.items)
          setPinnedTicker(msg)
          sessionStorage.setItem(PINNED_TICKER_KEY, msg)
        }
      })
      .catch(() => {})
  }, [language])

  const resolveDisplayName = useCallback(() => {
    const fromStorage = getConsentedDisplayName()
    if (fromStorage.length >= 2) return fromStorage
    const fromOnboard = onboardName.trim()
    if (fromOnboard.length >= 2) return fromOnboard
    return ''
  }, [onboardName])

  const finishOnboarding = useCallback(
    (name?: string) => {
      const trimmed = name?.trim() ?? ''
      localStorage.setItem(LANGUAGE_KEY, language)
      localStorage.setItem(ONBOARD_KEY, '1')
      if (trimmed.length >= 2) {
        setConsentedDisplayName(trimmed)
        publishRoastToTicker(trimmed, undefined, language)
      } else {
        clearDisplayNameOnSkip()
      }
      setShowOnboarding(false)
    },
    [language, publishRoastToTicker],
  )

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = onboardName.trim()
    if (name.length > 0 && name.length < 2) {
      setOnboardError(t.onboarding.nameError)
      return
    }
    setOnboardLoading(true)
    setOnboardError('')
    try {
      finishOnboarding(name)
    } catch {
      setOnboardError(t.genericError)
    } finally {
      setOnboardLoading(false)
    }
  }

  const handleOnboardSkip = () => {
    setOnboardError('')
    finishOnboarding()
  }

  const handleOnboardNext = () => {
    localStorage.setItem(LANGUAGE_KEY, language)
    setOnboardStep(2)
  }

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = captureEmail.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCaptureError('Please enter a valid email')
      return
    }
    setCaptureLoading(true)
    setCaptureError('')
    try {
      await fetchJson('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }, t.genericError)
      setCaptureSuccess(true)
      localStorage.setItem('rcv_email', email)
    } catch (err: unknown) {
      setCaptureError(err instanceof Error ? err.message : t.genericError)
    } finally {
      setCaptureLoading(false)
    }
  }

  const openEmailCapture = () => {
    setCaptureEmail('')
    setCaptureError('')
    setCaptureSuccess(false)
    setShowSignup(true)
  }

  const scrollToRoast = useCallback(() => {
    roastSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => fileInputRef.current?.click(), 400)
  }, [])

  useEffect(() => {
    setLoadMsgIdx(0)
  }, [language])

  useEffect(() => {
    if (!loading) return
    const msgs = loadingT.loading.length ? loadingT.loading : LOADING_MSGS_FALLBACK
    const interval = setInterval(() => {
      setLoadMsgIdx((i) => (i + 1) % msgs.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [loading, loadingLang, loadingT.loading])

  const handleFile = (f: File) => {
    if (/\.docx?$/i.test(f.name)) {
      setError('⚠️ Word .docx not supported — save as PDF first (File → Save as PDF), then upload.')
      setUploadHighlight(true)
      setTimeout(() => setUploadHighlight(false), 3000)
      return
    }
    if (!f.name.match(/\.(pdf|txt)$/i)) {
      setError(t.fileTypeError)
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(t.fileSizeError)
      return
    }
    setFile(f)
    setError('')
    setUploadHighlight(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleRoast = async () => {
    if (!file) {
      setError(t.uploadFirst)
      setUploadHighlight(true)
      setTimeout(() => setUploadHighlight(false), 2000)
      return
    }
    if (usesLeft <= 0) {
      setShowPaywall(true)
      return
    }
    setLoadingLang(language)
    setLoading(true)
    setLoadMsgIdx(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const parseData = await fetchJson<{ text: string }>('/api/parse', { method: 'POST', body: formData }, t.genericError)
      const roastData = await fetchRoast(parseData.text, intensity, language, fp || '', t.genericError)

      if (typeof roastData.usesLeft === 'number') {
        setUsesLeft(roastData.usesLeft)
      }

      if (typeof roastData.statsCount === 'number') {
        setRoastCount(parseStatCount(roastData.statsCount))
      }

      const displayName = resolveDisplayName()
      if (displayName) {
        if (!getConsentedDisplayName()) {
          setConsentedDisplayName(displayName)
        }
        publishRoastToTicker(displayName, roastData.score)
      }

      const shareToken = await savePublicRoastViaApi({
        score: roastData.score,
        intensity,
        language: roastData.language,
        lines: roastData.lines,
        title: roastData.title,
        verdict: roastData.verdict,
        fixes: roastData.fixes,
      })

      const roastId = shareToken ?? createRoastId()
      saveRoast(roastId, {
        lines: roastData.lines,
        score: roastData.score,
        intensity,
        language: roastData.language,
        title: roastData.title,
        verdict: roastData.verdict,
        fixes: roastData.fixes,
        resumeText: parseData.text,
        showTickerNamePrompt: !displayName,
        shareToken: shareToken ?? undefined,
      })
      router.push(`/roast/${roastId}`)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Free limit')) {
        setShowPaywall(true)
        setUsesLeft(0)
      } else {
        setError(err instanceof Error ? err.message : t.genericError)
      }
    } finally {
      setLoading(false)
      setLoadingLang(null)
    }
  }

  const activeDesc = t.intensity[intensity]?.desc ?? ''

  const userTicker = mergeTickerItems(pinnedTicker, tickerNames.slice(0, 4))
  const tickerItems = userTicker
  const loadingMsgs = loadingT.loading.length ? loadingT.loading : LOADING_MSGS_FALLBACK

  return (
    <main
      className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-bg-beige"
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={language}
    >
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
      {accountDeletedToast && (
        <div
          className="fixed left-1/2 top-4 z-[70] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#0f1f17] px-4 py-3 text-center font-body text-sm text-emerald-300 shadow-lg"
          role="status"
        >
          Your account has been deleted
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqPageJsonLd()) }}
      />
      <SiteHeader
        variant="home"
        activePath="home"
        roastCount={roastCount}
        statsLoading={statsLoading}
        statsSuffix={t.destroyed}
        statsShortSuffix={t.headerStat ?? 'CVs roasted'}
        usesLeft={usesLeft}
        roastsFreeLabel={t.roastsFree}
        joinLabel={t.join}
        onJoinClick={openEmailCapture}
        tickerItems={tickerItems}
        pinnedTicker={pinnedTicker}
      />

      <div className="flex-1 w-full max-w-[90rem] mx-auto px-4 md:px-8 py-6 md:py-10">
        <section className="home-landing-hero">
          <Reveal direction="left" className="elevate-light-panel home-landing-hero__panel p-8 md:p-10 lg:p-12">
            <div className="home-landing-hero__grid">
              <div className="home-landing-hero__copy">
                <HighVoltageBadge text={t.warningBadge} className="w-fit home-hero-badge" />
                <div className="home-hero-pills" aria-label="Product highlights">
                  {t.tagline.split('·').map((item) => {
                    const label = item.trim()
                    if (!label) return null
                    return (
                      <span key={label} className="home-hero-pill">
                        {label}
                      </span>
                    )
                  })}
                </div>
                <h1 className="home-landing-hero__title">
                  {t.hero.line1}
                  <span className="text-brand-orange"> {t.hero.line2}</span>
                </h1>
                <p className="home-landing-hero__sub">{t.hero.sub}</p>
                <HomePracticalCtas
                  roastCount={roastCount}
                  statsLoading={statsLoading}
                  roastLabel={t.destroyed}
                  onRoastClick={scrollToRoast}
                />
              </div>

              <div id="roast" ref={roastSectionRef} className="home-landing-hero__upload">
                <div className="home-upload-panel">
                  <p className="home-upload-panel__label">Try it now</p>
                  <p className="home-upload-panel__title">Upload your CV</p>
                  <p className="home-upload-panel__sub">PDF or TXT · Max 5MB · {usesLeft} free roast{usesLeft === 1 ? '' : 's'} left</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleRoast()
                    }}
                  >
                    <p
                      className="mb-3 rounded-lg border border-orange/30 bg-orange/[0.06] px-3 py-2 text-center font-body text-[12px] text-orange"
                      role="note"
                    >
                      ⚠️ Word (.docx) not supported — export as PDF first (File → Save as PDF)
                    </p>
                    <div
                      className={`upload-card home-upload-panel__drop p-5 md:p-6 text-center cursor-pointer mb-4 ${dragging ? 'dragover' : ''} ${uploadHighlight ? 'upload-error' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload your resume — PDF or TXT, max 5MB"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          fileInputRef.current?.click()
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        id="resume-upload"
                        name="resume"
                        type="file"
                        accept=".pdf,.txt,application/pdf,text/plain"
                        className="hidden"
                        aria-label="Choose resume file"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      />
                      {file ? (
                        <>
                          <p className="text-4xl mb-2">✅</p>
                          <p className="font-display text-lg text-orange mb-1 truncate px-2">{file.name}</p>
                          <p className="font-body text-[13px] text-muted">{t.readyRoast}</p>
                        </>
                      ) : (
                        <>
                          <UploadIcon />
                          <p className="font-display text-xl text-text-dark mb-1">{t.dropResume}</p>
                          <p className="font-body text-[13px] text-muted">{t.clickUpload}</p>
                          <p className="font-body text-[11px] text-subtle mt-1">{t.fileLimit}</p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 mb-2 max-[380px]:flex-col min-[381px]:overflow-x-auto min-[381px]:flex-nowrap lang-scroll pb-1">
                      {INTENSITY_IDS.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setIntensity(id)}
                          aria-label={`${t.intensity[id].label} roast mode`}
                          aria-pressed={intensity === id}
                          className="intensity-btn max-[380px]:w-full min-[381px]:flex-shrink-0"
                        >
                          {t.intensity[id].label}
                        </button>
                      ))}
                    </div>
                    <p className="font-body text-xs text-muted text-center mb-3">{activeDesc}</p>

                    <p className="font-body text-[11px] text-muted uppercase tracking-[0.1em] mb-2 text-center">{t.chooseLang}</p>
                    <LanguagePicker language={language} onSelect={selectLanguage} scrollHint={t.scrollHint} />
                    <p className="font-body text-[10px] text-subtle text-center mt-1 mb-4 hidden md:block">{t.langHint}</p>

                    {error && (
                      <div className="card-ui p-3 mb-3 font-body text-sm text-red-400 border-red-500/30">{error}</div>
                    )}

                    {loading ? (
                      <div className="btn-roast w-full py-3.5 md:py-4 flex flex-col items-center justify-center gap-1.5 opacity-90">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner shrink-0" />
                          <span className="font-display text-base md:text-lg text-white">{loadingT.roastingBtn}</span>
                        </div>
                        <span className="font-body text-xs text-white/80">{loadingMsgs[loadMsgIdx % loadingMsgs.length]}</span>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        aria-label={t.roastBtn}
                        className="btn-roast w-full py-3.5 md:py-4 text-base md:text-lg">
                        {t.roastBtn}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </Reveal>

          <TrustBar roastCount={roastCount} statsLoading={statsLoading} roastLabel={t.destroyed} />
        </section>

        <ElevateMarquee />

        <div className="elevate-dark px-4 md:px-8 py-12 md:py-16 -mx-4 md:-mx-8 mt-4">
        <div className="section-stack space-y-10 md:space-y-14 max-w-6xl mx-auto">
            <MotionFadeUp className="stats-panel">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                {[
                  { val: roastCount, color: 'text-orange', label: t.stats.roasted, skeleton: statsLoading, animate: true },
                  { val: String(INTENSITY_IDS.length), color: 'stats-panel__accent', label: t.stats.modes },
                  { val: '0', color: 'text-white', label: t.stats.mercy },
                  { val: '∞', color: 'text-gold', label: t.stats.dmg },
                ].map((s) => (
                  <div key={s.label} className="py-4 md:py-5 text-center px-2">
                    {'skeleton' in s && s.skeleton ? (
                      <div className="skeleton h-9 md:h-10 w-20 mx-auto mb-1.5" />
                    ) : 'animate' in s && s.animate ? (
                      <p className={`font-display text-3xl md:text-[40px] leading-none ${s.color}`}>
                        <NumberTicker
                          value={s.val as number}
                          startOnView
                          blur
                          duration={1}
                          format={(n) => n.toLocaleString('en-US')}
                          className={`font-display text-3xl md:text-[40px] leading-none ${s.color}`}
                        />
                      </p>
                    ) : (
                      <p className={`font-display text-3xl md:text-[40px] leading-none ${s.color}`}>{s.val}</p>
                    )}
                    <p className="font-body text-[10px] md:text-[11px] text-muted uppercase tracking-[0.1em] mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </MotionFadeUp>

            <section id="how-it-works" aria-label={t.howItWorks.title}>
              <SectionHeading title={t.howItWorks.title} />
              <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                {t.howItWorks.steps.map((step, i) => (
                  <MotionStaggerItem key={step.step} className="step-card">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <p className="font-body text-[11px] text-orange tracking-[0.14em]">{step.step}</p>
                      <HowItWorksIcon index={i} />
                    </div>
                    <h3 className="font-display text-xl md:text-[1.65rem] text-white mb-3 leading-tight tracking-wide">
                      {step.title}
                    </h3>
                    <p className="font-body text-[12px] md:text-[13px] text-dim leading-relaxed">
                      {step.desc}
                    </p>
                  </MotionStaggerItem>
                ))}
              </MotionStagger>
            </section>

            <section aria-label={t.disclaimer.title}>
              <p className="section-label mb-3">
                <span aria-hidden>🔥</span> {t.disclaimer.title}
              </p>
              <MotionFadeUp delay={0.08} className="disclaimer-box">
                <p className="font-body text-[13px] md:text-sm text-white leading-relaxed mb-5">
                  {t.disclaimer.body}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-border">
                  {t.disclaimer.tags.map((tag) => (
                    <span key={tag} className="font-body text-[10px] text-muted tracking-[0.1em] uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionFadeUp>
            </section>

            <section id="plans" aria-label="Plans">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <SectionHeading title="PLANS" />
                <Link
                  href="/plans"
                  className="font-body text-[12px] text-orange hover:text-white transition-colors uppercase tracking-wider shrink-0"
                >
                  Full plans &amp; features →
                </Link>
              </div>
              <MotionFadeUp delay={0.08}>
                <PricingPlans />
              </MotionFadeUp>
            </section>

            <section id="faq" aria-label="FAQ">
              <SectionHeading title="FAQ" />
              <MotionFadeUp delay={0.1} className="neo-frame neo-frame--soft border-border px-4 md:px-5">
                {t.faq.map((item, i) => (
                  <div key={i} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      aria-expanded={faqOpen === i}
                      aria-label={`FAQ: ${item.q}`}
                      className="w-full text-left py-3 font-body text-[12px] md:text-[13px] text-dim hover:text-white transition-colors flex justify-between items-center gap-3"
                    >
                      {item.q}
                      <span className="text-orange shrink-0 text-sm">{faqOpen === i ? '−' : '+'}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {faqOpen === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="font-body text-[12px] md:text-[13px] text-dim pb-3 leading-relaxed overflow-hidden"
                        >
                          {item.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </MotionFadeUp>
            </section>
        </div>
        </div>

        <div className="elevate-white px-4 md:px-8 py-12 md:py-16 pb-16 md:pb-20 -mx-4 md:-mx-8">
          <div className="section-stack space-y-10 md:space-y-14 max-w-6xl mx-auto">
            <RecentRoastsFeed />

            <WhatWeOffer variant="compact" />

            <CareerToolsSection />

            <HomeLongTailSection />

            <TopicClusterNav className="home-topic-nav" />
          </div>
        </div>
      </div>

      <SiteFooter tagline={t.footer} />

      {/* First-time onboarding */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
          <div className="card-ui p-6 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[2rem]" dir={isRtl ? 'rtl' : 'ltr'}>
            <p className="font-display text-2xl text-text-dark mb-1 text-center">{t.onboarding.welcome}</p>
            {onboardStep === 1 ? (
              <>
                <p className="font-body text-[13px] text-muted mb-5 text-center">
                  {t.onboarding.pickLangSub}
                </p>
                <p className="font-body text-[11px] text-muted uppercase tracking-[0.1em] mb-3 text-center">{t.onboarding.pickLang}</p>
                <LanguagePicker language={language} onSelect={selectLanguage} compact />
                <button
                  type="button"
                  onClick={handleOnboardNext}
                  className="btn-roast w-full py-3 text-base mt-5"
                >
                  {t.onboarding.next}
                </button>
              </>
            ) : (
              <form onSubmit={handleOnboarding} className="space-y-4 mt-4">
                <p className="font-body text-[13px] text-muted mb-2 text-center">{t.onboarding.yourName}</p>
                <input
                  type="text"
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder={t.onboarding.namePlaceholder}
                  maxLength={30}
                  autoFocus
                  autoComplete="off"
                  name="mcr-onboard-display-name"
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 font-body text-sm text-text-dark placeholder:text-muted focus:border-orange outline-none"
                  aria-label={t.onboarding.yourName}
                />
                {onboardError && <p className="font-body text-xs text-red-400">{onboardError}</p>}
                <button type="submit" disabled={onboardLoading} className="btn-roast w-full py-3 text-base">
                  {onboardLoading ? t.onboarding.loading : t.onboarding.start}
                </button>
                <button
                  type="button"
                  onClick={handleOnboardSkip}
                  disabled={onboardLoading}
                  className="w-full py-2 font-body text-sm text-muted hover:text-white transition-colors"
                >
                  {t.onboarding.skip}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Email capture */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="card-ui p-6 max-w-sm w-full rounded-[20px]" dir={isRtl ? 'rtl' : 'ltr'}>
            {captureSuccess ? (
              <p className="font-display text-xl text-text-dark text-center py-4">{t.emailCapture.success}</p>
            ) : (
              <form onSubmit={handleEmailCapture} className="space-y-3">
                <input
                  type="email"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder={t.emailCapture.emailPh}
                  autoFocus
                  required
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 font-body text-sm text-text-dark placeholder:text-muted focus:border-orange outline-none"
                  aria-label={t.emailCapture.emailPh}
                />
                <p className="font-body text-[11px] text-muted">{t.emailCapture.noSpam}</p>
                {captureError && <p className="font-body text-xs text-red-400">{captureError}</p>}
                <button type="submit" disabled={captureLoading} className="btn-roast w-full py-3 text-base">
                  {captureLoading ? t.onboarding.loading : t.emailCapture.submit}
                </button>
              </form>
            )}
            <button type="button" onClick={() => setShowSignup(false)} className="w-full font-body text-[13px] text-subtle hover:text-muted py-1 mt-2">
              {t.signup.later}
            </button>
          </div>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="card-ui p-8 max-w-sm w-full text-center rounded-[2rem]" dir={isRtl ? 'rtl' : 'ltr'}>
            <p className="text-[48px] mb-4">😅</p>
            <h3 className="font-display text-[28px] text-text-dark mb-2">{t.paywall.title}</h3>
            <p className="font-body text-sm text-muted mb-6">{t.paywall.sub}</p>
            <span className="inline-block bg-orange text-black font-body text-[13px] px-4 py-1.5 rounded-full mb-6">
              {t.paywall.price}
            </span>
            {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? (
              <RazorpayProButton
                fp={fp}
                className="btn-roast w-full py-3 text-base mb-3"
                onSuccess={() => {
                  setUsesLeft(999)
                  setShowPaywall(false)
                }}
              >
                {t.paywall.unlock}
              </RazorpayProButton>
            ) : (
              <Link href="/plans" className="btn-roast w-full py-3 text-base mb-3 block">
                {t.paywall.unlock}
              </Link>
            )}
            <button type="button" onClick={() => setShowPaywall(false)} className="font-body text-[13px] text-subtle hover:text-muted">
              {t.paywall.later}
            </button>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
