'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'conversational', label: 'Conversational' },
  { id: 'hinglish', label: 'Hinglish (India)' },
]

const LENGTHS = [
  { id: 'short', label: 'Short (150 words)' },
  { id: 'standard', label: 'Standard (300 words)' },
  { id: 'full', label: 'Full (500 words)' },
]

export default function CoverLetterPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('cover-letter')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('standard')
  const [result, setResult] = useState('')
  const [editable, setEditable] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/cover-letter', { cv, jobDescription: jd, company, tone, length })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    const text = (res.data as { result: string }).result
    setResult(text)
    history.bumpHistory()
    setEditable(text)
    setEditing(false)
  }

  const download = () => {
    const blob = new Blob([editing ? editable : result], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cover-letter.txt'
    a.click()
  }

  if (loading) return null

  return (
    <ToolShell
      title="Cover Letter Generator"
      subtitle="CV + job description → a tailored cover letter in 30 seconds"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="cover-letter"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Job description</label>
          <textarea className="dash-tools-textarea" rows={6} value={jd} onChange={(e) => setJd(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Company name (optional)</label>
          <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <span className="dash-tools-label">Tone</span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button key={t.id} type="button" className={`dash-tools-chip ${tone === t.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setTone(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="dash-tools-label">Length</span>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map((l) => (
              <button key={l.id} type="button" className={`dash-tools-chip ${length === l.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setLength(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={generate}>
          {busy ? 'Generating…' : 'Generate Cover Letter 📝'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="dash-tools-card p-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={() => setEditing((v) => !v)}>{editing ? 'Preview' : 'Edit'}</button>
            <CopyButton text={editing ? editable : result} />
            <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={generate}>Regenerate</button>
            <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={download}>Download .txt</button>
          </div>
          {editing ? (
            <textarea className="dash-tools-textarea min-h-[280px]" value={editable} onChange={(e) => setEditable(e.target.value)} />
          ) : (
            <pre className="dash-tools-output whitespace-pre-wrap">{result}</pre>
          )}
        </div>
      )}
    </ToolShell>
  )
}
