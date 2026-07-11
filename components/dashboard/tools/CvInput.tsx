'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { Check, Upload } from 'lucide-react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'

const SOURCE_LABEL: Record<string, string> = {
  upload: 'uploaded file',
  paste: 'pasted text',
  roast: 'last roast',
  builder: 'Resume Builder',
}

function SavedCvBanner({
  label,
  fileName,
  source,
  onChange,
}: {
  label: string
  fileName: string | null
  source: string | null
  onChange: () => void
}) {
  const sourceLabel = source ? SOURCE_LABEL[source] ?? source : 'your account'

  return (
    <div className="space-y-2">
      <span className="dash-tools-label">{label}</span>
      <div className="dash-tools-saved">
        <Check className="size-4 shrink-0" aria-hidden />
        <span>
          CV saved — all AI tools will use it
          {fileName ? ` (${fileName})` : ` from ${sourceLabel}`}
        </span>
      </div>
      <button
        type="button"
        className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-accent)] underline"
        onClick={onChange}
      >
        Upload a different CV
      </button>
    </div>
  )
}

export function CvInput({
  label = 'Your CV',
  hideWhenSaved = false,
}: {
  label?: string
  /** When true, render nothing if CV is already saved (tool card duplicate). */
  hideWhenSaved?: boolean
}) {
  const { cv, fileName, source, hasCv, loading, editing, setEditing, saveCv } = useDashboardCv()
  const [paste, setPaste] = useState('')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const parseFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(pdf|txt)$/i)) {
        setError('Please upload a PDF or TXT file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be under 5 MB.')
        return
      }

      setError('')
      setJustSaved(false)
      setBusy(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/parse', { method: 'POST', body: formData })

        let data: { text?: string; error?: string } = {}
        try {
          data = await res.json()
        } catch {
          throw new Error('Could not read the server response. Try again.')
        }

        if (!res.ok) {
          throw new Error(data.error ?? 'Could not read your file.')
        }

        const text = typeof data.text === 'string' ? data.text.trim() : ''
        if (text.length < 50) {
          throw new Error('Not enough text found in that file. Try another PDF or paste your CV.')
        }

        const result = await saveCv(text, { fileName: file.name, source: 'upload' })
        if (!result.ok) {
          throw new Error(result.error ?? 'Could not save your CV.')
        }

        setJustSaved(true)
        setPaste('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed. Try again.')
      } finally {
        setBusy(false)
      }
    },
    [saveCv],
  )

  const savePaste = async () => {
    setError('')
    setJustSaved(false)
    if (paste.trim().length < 50) {
      setError('Paste at least a few lines of your CV.')
      return
    }
    setBusy(true)
    try {
      const result = await saveCv(paste, { fileName: 'Pasted CV', source: 'paste' })
      if (!result.ok) {
        throw new Error(result.error ?? 'Could not save your CV.')
      }
      setJustSaved(true)
      setPaste('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="dash-tools-card p-4 text-sm text-[var(--dash-muted)]">Loading your CV…</div>
  }

  if (hasCv && !editing) {
    if (hideWhenSaved) return null
    return (
      <SavedCvBanner
        label={label}
        fileName={fileName}
        source={source}
        onChange={() => {
          setJustSaved(false)
          setEditing(true)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <span className="dash-tools-label">{label}</span>
      <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
        Upload once — every AI tool in your dashboard will use this CV automatically.
      </p>

      {justSaved && (
        <div className="dash-tools-saved">
          <Check className="size-4 shrink-0" aria-hidden />
          <span>CV saved successfully.</span>
        </div>
      )}

      <label
        htmlFor={inputId}
        className={`dash-upload block p-8 text-center cursor-pointer ${dragging ? 'dash-upload--drag' : ''} ${busy ? 'opacity-70 pointer-events-none' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) void parseFile(f)
        }}
      >
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf,text/plain,.txt"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void parseFile(f)
            e.target.value = ''
          }}
        />
        <Upload className="mx-auto mb-2 size-8 text-[var(--dash-accent)]" aria-hidden />
        <p className="text-sm font-medium text-[var(--dash-text)]">
          {busy ? 'Reading your CV…' : 'Drop PDF or TXT here, or click to choose a file'}
        </p>
        <p className="mt-1 text-xs text-[var(--dash-muted)]">Max 5 MB · PDF or TXT</p>
      </label>

      <div className="relative text-center">
        <span className="bg-white px-3 text-xs text-[var(--dash-muted)]">or paste text</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-[var(--dash-border)]" aria-hidden />
      </div>

      <textarea
        className="dash-tools-textarea"
        rows={6}
        value={paste}
        disabled={busy}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste your CV text here…"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="dash-tools-btn text-sm" disabled={busy} onClick={() => void savePaste()}>
          {busy ? 'Saving…' : 'Save CV for all tools'}
        </button>
        {hasCv && (
          <button
            type="button"
            className="dash-tools-btn--ghost dash-tools-btn text-sm py-2 px-3"
            onClick={() => {
              setJustSaved(false)
              setEditing(false)
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function extractBulletsFromCv(cv: string): string[] {
  return cv
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^([•\-*–]|\d+[.)])\s+/.test(line) || (line.length > 20 && line.length < 220))
    .map((line) => line.replace(/^([•\-*–]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
    .slice(0, 40)
}
