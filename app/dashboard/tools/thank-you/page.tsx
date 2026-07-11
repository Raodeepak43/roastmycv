'use client'

import { useState } from 'react'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'warm', label: 'Warm' },
  { id: 'brief', label: 'Brief (50 words)' },
]

export default function ThankYouPage() {
  const { isPro, loading, access } = useToolPlan('thank-you')
  const history = useToolHistory()
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewerRole, setInterviewerRole] = useState('')
  const [company, setCompany] = useState('')
  const [discussed, setDiscussed] = useState('')
  const [yourName, setYourName] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/thank-you', {
      interviewerName, interviewerRole, company, discussed, yourName, tone,
    })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      title="Thank You Email After Interview"
      subtitle="Send within 24 hours. Most candidates don't. You will."
      access={access}
      isPro={isPro}
      toolSlug="thank-you"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dash-tools-label">Interviewer name</label>
            <input className="dash-tools-input" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} />
          </div>
          <div>
            <label className="dash-tools-label">Interviewer role</label>
            <input className="dash-tools-input" value={interviewerRole} onChange={(e) => setInterviewerRole(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Company name</label>
          <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Things discussed in the interview</label>
          <textarea className="dash-tools-textarea" rows={3} value={discussed} onChange={(e) => setDiscussed(e.target.value)} placeholder="e.g. their product roadmap for Q3, the team's approach to microservices" />
        </div>
        <div>
          <label className="dash-tools-label">Your name</label>
          <input className="dash-tools-input" value={yourName} onChange={(e) => setYourName(e.target.value)} />
        </div>
        <div>
          <span className="dash-tools-label">Tone</span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button key={t.id} type="button" className={`dash-tools-chip ${tone === t.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setTone(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write Thank You Email ✉️'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {result && (
        <div className="space-y-3">
          <CopyButton text={result} label="📋 Copy email" />
          <pre className="dash-tools-output whitespace-pre-wrap">{result}</pre>
          <p className="dash-tools-hint">Send timing tip: Send today before 6pm. Tomorrow is too late.</p>
        </div>
      )}
    </ToolShell>
  )
}
