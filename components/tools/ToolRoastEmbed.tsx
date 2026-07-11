'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { getUi, type IntensityKey } from '@/app/i18n'
import { fetchRoast, ROAST_INTENSITY_IDS, ROAST_LANGUAGES } from '@/lib/roast/client'
import { createRoastId, saveRoast } from '@/lib/roast-session'
import { fetchGuestUsage } from '@/lib/usage/client'
import { FREE_LIMIT } from '@/lib/usage'

type Props = {
  defaultLanguage?: string
  defaultIntensity?: IntensityKey
  hideLanguagePicker?: boolean
  hideIntensityPicker?: boolean
}

function UploadIcon() {
  return (
    <svg className="mx-auto mb-3 h-10 w-10 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

export function ToolRoastEmbed({
  defaultLanguage = 'hinglish',
  defaultIntensity = 'gaali_light',
  hideLanguagePicker = false,
  hideIntensityPicker = false,
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [intensity, setIntensity] = useState<IntensityKey>(defaultIntensity)
  const [language, setLanguage] = useState(defaultLanguage)
  const [usesLeft, setUsesLeft] = useState(FREE_LIMIT)
  const [fp, setFp] = useState('')

  const t = getUi(language)

  useEffect(() => {
    setLanguage(defaultLanguage)
    setIntensity(defaultIntensity)
  }, [defaultLanguage, defaultIntensity])

  useEffect(() => {
    ;(async () => {
      try {
        const agent = await FingerprintJS.load()
        const result = await agent.get()
        setFp(result.visitorId)
        const data = await fetchGuestUsage(result.visitorId)
        setUsesLeft(data.usesLeft)
      } catch {
        const data = await fetchGuestUsage()
        setUsesLeft(data.usesLeft)
      }
    })()
  }, [])

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
      setError('Free roast limit reached — upgrade on homepage or sign in.')
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

      const roastData = await fetchRoast(parseData.text, intensity, language, fp || '', t.genericError)

      if (typeof roastData.usesLeft === 'number') {
        setUsesLeft(roastData.usesLeft)
      }

      const roastId = createRoastId()
      saveRoast(roastId, {
        lines: roastData.lines,
        score: roastData.score,
        intensity,
        language: roastData.language,
        title: roastData.title,
        verdict: roastData.verdict,
        fixes: roastData.fixes,
        resumeText: parseData.text,
        showTickerNamePrompt: false,
      })
      router.push(`/roast/${roastId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-roast-embed rounded-xl border border-border bg-black/40 p-4 md:p-6">
      <p className="mb-4 text-center font-body text-xs text-muted">
        {usesLeft > 0 ? `${usesLeft} free roast${usesLeft === 1 ? '' : 's'} left · no signup` : 'Free limit reached'}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleRoast()
        }}
      >
        <div
          className={`upload-card mb-4 cursor-pointer p-6 text-center ${dragging ? 'dragover' : ''}`}
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
              <p className="mb-1 text-3xl">✅</p>
              <p className="truncate font-display text-lg text-orange">{file.name}</p>
              <p className="font-body text-sm text-muted">{t.readyRoast}</p>
            </>
          ) : (
            <>
              <UploadIcon />
              <p className="font-display text-lg text-white">{t.dropResume}</p>
              <p className="font-body text-sm text-muted">{t.clickUpload}</p>
            </>
          )}
        </div>

        {!hideIntensityPicker && (
          <>
            <div className="mb-2 flex flex-wrap gap-2">
              {ROAST_INTENSITY_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIntensity(id)}
                  aria-pressed={intensity === id}
                  className="intensity-btn rounded-none text-sm"
                >
                  {t.intensity[id].label}
                </button>
              ))}
            </div>
            <p className="mb-4 text-center font-body text-xs text-muted">{t.intensity[intensity]?.desc}</p>
          </>
        )}

        {!hideLanguagePicker && (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {ROAST_LANGUAGES.slice(0, 6).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                aria-pressed={language === lang.code}
                className={`rounded-full border px-3 py-1 font-body text-xs transition-colors ${
                  language === lang.code ? 'border-orange bg-orange/10 text-orange' : 'border-border text-muted hover:text-white'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mb-3 text-center font-body text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn-roast w-full py-3.5 text-base disabled:opacity-60">
          {loading ? t.roastingBtn : t.roastBtn}
        </button>
      </form>
    </div>
  )
}
