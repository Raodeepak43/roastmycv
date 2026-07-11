'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Zap, Globe, Flame } from 'lucide-react'
import { getUi, type IntensityKey } from '@/app/i18n'
import { ROAST_INTENSITY_IDS, ROAST_LANGUAGES } from '@/lib/roast/client'
import { saveRoast } from '@/lib/roast-session'
import { savePublicRoastViaApi } from '@/lib/roast/public-save'
import { USER_FREE_ROASTS, type UserPlan } from '@/lib/dashboard/constants'
import {
  dashboardRoastLimitHint,
  dashboardRoastLimitLabel,
} from '@/lib/dashboard/roast-limit'
import { mergeUsage, recordClientRoast, getClientUsage, importSessionRoastsToClient } from '@/lib/dashboard/client-store'
import { markPageVisited } from '@/lib/dashboard/onboarding'
import { getRoastPreferences, saveRoastPreferences } from '@/lib/dashboard/roast-preferences'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'

export function DashboardRoastPanel() {
  const router = useRouter()
  const { userId } = useDashboardUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [intensity, setIntensity] = useState<IntensityKey>('gaali_light')
  const [language, setLanguage] = useState('hinglish')
  const [usesLeft, setUsesLeft] = useState(USER_FREE_ROASTS)
  const [roastsLimit, setRoastsLimit] = useState(USER_FREE_ROASTS)
  const [plan, setPlan] = useState<UserPlan>('free')
  const [dbReady, setDbReady] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const t = getUi(language)

  useEffect(() => {
    if (userId) {
      markPageVisited(userId, 'roast')
      const prefs = getRoastPreferences(userId)
      if (prefs) {
        setIntensity(prefs.intensity)
        setLanguage(prefs.language)
      }
    }
  }, [userId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/me', { cache: 'no-store', credentials: 'include' })
        if (res.status === 401) {
          window.location.href = '/login?reason=session_expired'
          return
        }
        if (!res.ok || cancelled) return
        const data = await res.json()
        const ready = Boolean(data.dbReady)
        setDbReady(ready)
        if (!ready && userId) importSessionRoastsToClient(userId)
        const merged = mergeUsage(data.usage, userId, ready)
        setUsesLeft(merged.roastsLeft)
        setRoastsLimit(merged.roastsLimit)
        setPlan((merged.plan as UserPlan) ?? 'free')
      } catch {
        if (!dbReady && userId) {
          const used = getClientUsage(userId).roastsUsed
          setUsesLeft(Math.max(0, USER_FREE_ROASTS - used))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleFile = (f: File) => {
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
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleRoast = async () => {
    if (!file) {
      setError(t.uploadFirst)
      return
    }
    if (usesLeft <= 0) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const parseRes = await fetch('/api/parse', { method: 'POST', body: formData })
      const parseData = await parseRes.json()
      if (!parseRes.ok) throw new Error(parseData.error ?? t.genericError)

      window.dispatchEvent(
        new CustomEvent('mcr-dashboard-cv-sync', {
          detail: { text: parseData.text, fileName: file.name, source: 'roast' },
        }),
      )

      const roastRes = await fetch('/api/dashboard/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: parseData.text,
          intensity,
          language,
          fileName: file.name,
        }),
      })

      const roastData = await roastRes.json()
      if (!roastRes.ok) {
        if (roastRes.status === 429) {
          setShowPaywall(true)
          setUsesLeft(0)
          return
        }
        throw new Error(roastData.error ?? t.genericError)
      }

      const shareToken = await savePublicRoastViaApi({
        score: roastData.score,
        intensity: roastData.intensity ?? intensity,
        language: roastData.language ?? language,
        lines: roastData.lines,
        title: roastData.title,
        verdict: roastData.verdict,
        fixes: roastData.fixes,
      })

      saveRoast(roastData.id, {
        lines: roastData.lines,
        score: roastData.score,
        intensity: roastData.intensity,
        language: roastData.language,
        title: roastData.title,
        verdict: roastData.verdict,
        fixes: roastData.fixes,
        resumeText: parseData.text,
        showTickerNamePrompt: false,
        shareToken: shareToken ?? undefined,
      })

      if (!roastData.saved && userId && !dbReady) {
        const local = recordClientRoast(userId, {
          id: roastData.id,
          score: roastData.score,
          title: roastData.title ?? null,
          verdict: roastData.verdict ?? null,
          file_name: file.name,
          created_at: new Date().toISOString(),
          intensity: roastData.intensity ?? intensity,
          language: roastData.language ?? language,
        })
        setUsesLeft(local.roastsLeft)
        setRoastsLimit(USER_FREE_ROASTS)
      } else if (roastData.usage) {
        setUsesLeft(roastData.usage.roastsLeft ?? 0)
        setRoastsLimit(roastData.usage.roastsLimit ?? USER_FREE_ROASTS)
        if (roastData.usage.plan) setPlan(roastData.usage.plan as UserPlan)
      }

      router.push(`/dashboard/roast/${roastData.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DashboardPageHeader
        title="Roast my CV"
        description="Upload your resume and get brutally honest AI feedback — saved to your account."
        action={
          <div className="max-w-[240px] text-right">
            <span className="dash-badge">{dashboardRoastLimitLabel(usesLeft, plan)}</span>
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              {dashboardRoastLimitHint(plan, roastsLimit)}
            </p>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-5 lg:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <div className="dash-card">
            <div className="dash-card-body space-y-5">
              <div
                className={`dash-upload p-8 text-center md:p-10 ${dragging ? 'dash-upload--drag' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <>
                    <p className="mb-2 text-3xl">✅</p>
                    <p className="truncate text-base font-semibold text-gray-900">{file.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{t.readyRoast}</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto mb-3 size-10 text-[#ff4500]" strokeWidth={1.5} />
                    <p className="text-base font-semibold text-gray-900">{t.dropResume}</p>
                    <p className="mt-1 text-sm text-gray-500">{t.clickUpload}</p>
                    <p className="mt-2 text-xs text-gray-400">{t.fileLimit}</p>
                  </>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Roast intensity
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROAST_INTENSITY_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setIntensity(id)
                        if (userId) saveRoastPreferences(userId, { intensity: id, language })
                      }}
                      aria-pressed={intensity === id}
                      className={`dash-intensity ${intensity === id ? 'dash-intensity--active' : ''}`}
                    >
                      {t.intensity[id].label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">{t.intensity[intensity]?.desc}</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t.chooseLang}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROAST_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code)
                        if (userId) saveRoastPreferences(userId, { intensity, language: lang.code })
                      }}
                      aria-pressed={language === lang.code}
                      className={`dash-chip ${language === lang.code ? 'dash-chip--active' : ''}`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="dash-alert-error">{error}</div>}

              <button
                type="button"
                onClick={handleRoast}
                disabled={loading}
                className="dash-btn-primary"
              >
                <Flame className="size-4" aria-hidden />
                {loading ? t.roastingBtn : t.roastBtn}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-5 xl:col-span-4">
          <div className="dash-card">
            <div className="dash-card-header">
              <p className="text-sm font-semibold text-gray-900">How it works</p>
            </div>
            <div className="dash-card-body space-y-4 text-sm text-gray-600">
              {[
                { step: '1', text: 'Upload PDF or TXT (max 5MB)' },
                { step: '2', text: 'Pick intensity & language' },
                { step: '3', text: 'AI roasts your resume — saved to history' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                    {step}
                  </span>
                  <span className="pt-0.5">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-body">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Zap className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Account usage</p>
                  <p className="text-xs text-gray-500">
                    {plan === 'pro'
                      ? 'Unlimited roasts on Pro'
                      : `${usesLeft} of ${roastsLimit} roasts remaining`}
                  </p>
                  {plan !== 'pro' && (
                    <p className="mt-1 text-[11px] leading-snug text-gray-400">
                      {dashboardRoastLimitHint(plan, roastsLimit)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#ff4500] transition-all"
                  style={{ width: `${roastsLimit > 0 ? (usesLeft / roastsLimit) * 100 : 0}%` }}
                />
              </div>
              <Link
                href="/dashboard/history"
                className="mt-4 block text-center text-xs font-medium text-[#ff4500] hover:underline"
              >
                View roast history →
              </Link>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-body flex items-start gap-3">
              <Globe className="mt-0.5 size-5 shrink-0 text-gray-400" aria-hidden />
              <p className="text-xs leading-relaxed text-gray-500">
                Results stay in your dashboard. Your file is processed instantly and not stored — only the roast text
                is saved to your history.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 px-4 backdrop-blur-sm">
          <div className="dash-card w-full max-w-sm p-8 text-center">
            <p className="mb-4 text-5xl">😅</p>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">{t.paywall.title}</h3>
            <p className="mb-6 text-sm text-gray-500">{t.paywall.sub}</p>
            <Link href="/dashboard/plans" className="dash-btn-primary mb-3 inline-flex w-full justify-center">
              View plans
            </Link>
            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t.paywall.later}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
