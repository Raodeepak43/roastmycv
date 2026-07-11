'use client'

import { useEffect, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { HighVoltageBadge, SectionHeading } from '@/components/UiChrome'
import { MotionFadeUp, motion } from '@/components/Motion'
import { getUi, type IntensityKey } from '@/app/i18n'
import { ROAST_INTENSITY_IDS, ROAST_LANGUAGES } from '@/lib/roast/client'
import { LINKEDIN_FREE_LIMIT } from '@/lib/linkedin-usage'
import { savePublicRoastViaApi } from '@/lib/roast/public-save'
import { LinkedInRoastResultView, type LinkedInRoastDisplay } from '@/components/linkedin-roast/LinkedInRoastResultView'

export function LinkedInRoastApp() {
  const [inputMode, setInputMode] = useState<'paste' | 'url'>('paste')
  const [profileText, setProfileText] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [intensity, setIntensity] = useState<IntensityKey>('gaali_light')
  const [language, setLanguage] = useState('hinglish')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usesLeft, setUsesLeft] = useState(LINKEDIN_FREE_LIMIT)
  const [fp, setFp] = useState('')
  const [result, setResult] = useState<LinkedInRoastDisplay | null>(null)
  const [shareToken, setShareToken] = useState<string>()

  const t = getUi(language)

  useEffect(() => {
    ;(async () => {
      try {
        const agent = await FingerprintJS.load()
        const r = await agent.get()
        setFp(r.visitorId)
        const q = `?fp=${encodeURIComponent(r.visitorId)}`
        const res = await fetch(`/api/linkedin-usage${q}`, { cache: 'no-store', credentials: 'include' })
        const data = await res.json()
        setUsesLeft(data.usesLeft ?? LINKEDIN_FREE_LIMIT)
      } catch {
        const res = await fetch('/api/linkedin-usage', { cache: 'no-store', credentials: 'include' })
        const data = await res.json()
        setUsesLeft(data.usesLeft ?? LINKEDIN_FREE_LIMIT)
      }
    })()
  }, [])

  const handleRoast = async () => {
    const pasted = profileText.trim()
    const url = profileUrl.trim()

    if (inputMode === 'paste' && pasted.length < 80) {
      setError('Paste your full LinkedIn profile — Ctrl+A on your profile page, then Ctrl+C here.')
      return
    }
    if (inputMode === 'url' && !url) {
      setError('Enter your LinkedIn profile URL (linkedin.com/in/your-name)')
      return
    }
    if (usesLeft <= 0) {
      setError('Free limit reached — sign in for dashboard tools or upgrade to Pro.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/linkedin-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          profileText: inputMode === 'paste' ? profileText : undefined,
          profileUrl: inputMode === 'url' ? profileUrl : undefined,
          intensity,
          language,
          fp: fp || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Roast failed')

      const display: LinkedInRoastDisplay = {
        score: data.score,
        sectionScores: data.sectionScores,
        lines: data.lines ?? [],
        title: data.title,
        verdict: data.verdict,
        fixes: data.fixes,
        intensity,
        language,
      }
      setResult(display)

      const token = await savePublicRoastViaApi({
        score: data.score,
        intensity,
        language,
        lines: data.lines ?? [],
        title: data.title,
        verdict: data.verdict,
        fixes: data.fixes,
      })
      if (token) setShareToken(token)

      if (typeof data.usesLeft === 'number') {
        setUsesLeft(data.usesLeft)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-bg-beige">
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <SiteHeader
          variant="home"
          activePath="linkedin-roast"
          breadcrumb="LinkedIn Roast"
          usesLeft={usesLeft}
          roastsFreeLabel="free"
          usesTitle={`${usesLeft} free LinkedIn roasts remaining`}
        />

        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {!result ? (
            <div className="max-w-xl mx-auto w-full">
              <MotionFadeUp inView={false} className="text-center mb-8">
                <Link href="/" className="font-display text-lg text-text-dark hover:text-orange inline-flex items-center gap-2 mb-4">
                  🔥 MyCV<span className="text-orange">Roast</span>
                </Link>
                <HighVoltageBadge text="LINKEDIN ROAST" className="mx-auto mb-4" />
                <h1 className="font-display leading-[1.05] mb-4">
                  <span className="block text-[clamp(1.75rem,6vw,3rem)] text-text-dark">Tera LinkedIn Profile</span>
                  <span className="block text-[clamp(1.75rem,6vw,3rem)] text-orange mt-1">Ek Joke Hai.</span>
                </h1>
                <p className="font-body text-sm text-muted max-w-md mx-auto">
                  AI batayega kyun recruiters tera connection request ignore karte hain.
                </p>
              </MotionFadeUp>

              <div className="rounded-[2rem] border border-black/10 bg-white p-5 md:p-6 space-y-4 shadow-sm">
                <div className="flex gap-2" role="tablist" aria-label="Profile input method">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === 'paste'}
                    onClick={() => setInputMode('paste')}
                    className={`flex-1 py-2.5 text-xs font-body border transition-colors min-h-[44px] ${inputMode === 'paste' ? 'border-orange bg-orange/10 text-orange' : 'border-border text-muted hover:border-orange/50'}`}
                  >
                    Paste text
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === 'url'}
                    onClick={() => setInputMode('url')}
                    className={`flex-1 py-2.5 text-xs font-body border transition-colors min-h-[44px] ${inputMode === 'url' ? 'border-orange bg-orange/10 text-orange' : 'border-border text-muted hover:border-orange/50'}`}
                  >
                    Profile URL
                  </button>
                </div>

                {inputMode === 'paste' ? (
                  <>
                    <label className="font-body text-[11px] text-muted uppercase tracking-wider">Paste your LinkedIn profile</label>
                    <textarea
                      className="w-full min-h-[180px] bg-bg-beige border border-border rounded-xl px-4 py-3 font-body text-sm text-text-dark placeholder:text-muted focus:border-orange outline-none resize-y"
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      placeholder="Go to your LinkedIn profile → Ctrl+A → Ctrl+C → paste here"
                    />
                  </>
                ) : (
                  <>
                    <label className="font-body text-[11px] text-muted uppercase tracking-wider">LinkedIn profile URL</label>
                    <input
                      type="url"
                      inputMode="url"
                      className="w-full min-h-[44px] bg-bg-beige border border-border rounded-xl px-4 py-3 font-body text-sm text-text-dark placeholder:text-muted focus:border-orange outline-none"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/your-name"
                      autoComplete="url"
                    />
                    <p className="font-body text-[11px] text-muted leading-relaxed">
                      Public profiles only. Private or login-walled profiles — use paste text instead.
                    </p>
                  </>
                )}

                <div>
                  <SectionHeading title="INTENSITY" />
                  <div className="flex gap-2 mt-2">
                    {ROAST_INTENSITY_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setIntensity(id)}
                        className={`flex-1 py-2.5 text-xs font-body border transition-colors ${intensity === id ? 'border-orange bg-orange/10 text-orange' : 'border-border text-muted hover:border-orange/50'}`}
                      >
                        {t.intensity[id]?.label ?? id}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeading title={t.chooseLang ?? 'LANGUAGE'} />
                  <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                    {ROAST_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`px-3 py-1.5 text-xs font-body border transition-colors ${language === lang.code ? 'border-orange bg-orange/10 text-orange' : 'border-border text-muted'}`}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-400 font-body">{error}</p>}

                <motion.button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleRoast()}
                  className="btn-roast w-full py-3.5 text-base disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? '🔥 Roasting…' : '🔥 Roast Kar Mera LinkedIn'}
                </motion.button>

                <p className="text-center font-body text-xs text-muted">
                  {usesLeft} free LinkedIn roast{usesLeft === 1 ? '' : 's'} left ·{' '}
                  <Link href="/" className="text-orange hover:underline">CV roast</Link> bhi try karo
                </p>
              </div>
            </div>
          ) : (
            <LinkedInRoastResultView
              result={result}
              shareToken={shareToken}
              onReset={() => { setResult(null); setShareToken(undefined) }}
            />
          )}
        </div>

        <SiteFooter tagline={t.footer} cinematicInstant />
      </div>
    </main>
  )
}
