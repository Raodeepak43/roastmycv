'use client'

import { useMemo, useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {CopyButton, MarkdownBlock, ToolError, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const CONTEXTS = [
  { id: 'interview', label: 'Job interview' },
  { id: 'networking', label: 'Networking event' },
  { id: 'linkedin', label: 'LinkedIn voice note' },
  { id: 'campus', label: 'Campus placement' },
]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ElevatorPitchPage() {
  const { isPro, loading, access } = useToolPlan('elevator-pitch')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [targetRole, setTargetRole] = useState('')
  const [context, setContext] = useState('interview')
  const [language, setLanguage] = useState('english')
  const [result, setResult] = useState('')
  const [showLong, setShowLong] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const parts = useMemo(() => result.split('---VERSION---').map((p) => p.trim()).filter(Boolean), [result])
  const shortPitch = parts[0] ?? ''
  const longPitch = parts[1] ?? ''
  const tips = parts[2] ?? ''

  const readAloud = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/\*\*/g, '').replace(/\[pause\]/gi, '...')
    const utter = new SpeechSynthesisUtterance(clean)
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  }

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/elevator-pitch', { cv, targetRole, context, language })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      title="Your 30-Second Elevator Pitch"
      subtitle="Answer 'tell me about yourself' without freezing up"
      access={access}
      isPro={isPro}
      toolSlug="elevator-pitch"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Target role</label>
          <input className="dash-tools-input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <div>
          <span className="dash-tools-label">Context</span>
          <div className="flex flex-wrap gap-2">
            {CONTEXTS.map((c) => (
              <button key={c.id} type="button" className={`dash-tools-chip ${context === c.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setContext(c.id)}>{c.label}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="dash-tools-label">Language</span>
          <div className="flex flex-wrap gap-2">
            {['english', 'hinglish'].map((l) => (
              <button key={l} type="button" className={`dash-tools-chip ${language === l ? 'dash-tools-chip--active' : ''}`} onClick={() => setLanguage(l)}>{l === 'hinglish' ? 'Hinglish' : 'English'}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write My Pitch 🎤'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {shortPitch && (
        <div className="space-y-4">
          <div className="dash-tools-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-orange">30-second script · {wordCount(shortPitch)} words</h3>
              <div className="flex gap-2">
                <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={() => readAloud(shortPitch)}>🔊 Read aloud</button>
                <CopyButton text={shortPitch.replace(/\*\*/g, '').replace(/\[pause\]/gi, '')} label="📋 Copy" />
              </div>
            </div>
            <MarkdownBlock content={shortPitch} />
          </div>
          {longPitch && (
            <>
              <button type="button" className="text-sm text-orange hover:underline" onClick={() => setShowLong((v) => !v)}>
                {showLong ? 'Hide' : 'Show'} 60-second version
              </button>
              {showLong && (
                <div className="dash-tools-card p-5 space-y-3">
                  <div className="flex justify-between gap-2">
                    <h3 className="text-sm font-semibold text-orange">60-second · {wordCount(longPitch)} words</h3>
                    <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={() => readAloud(longPitch)}>🔊 Read aloud</button>
                  </div>
                  <MarkdownBlock content={longPitch} />
                </div>
              )}
            </>
          )}
          {tips && <MarkdownBlock content={tips} />}
        </div>
      )}
    </ToolShell>
  )
}
