'use client'

import { useState } from 'react'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'

const SITUATIONS = [
  { id: 'interview', label: 'After interview — no result yet' },
  { id: 'applied', label: 'After applying — no interview invite' },
  { id: 'cold', label: 'After sending cold email — no reply' },
]

export default function FollowUpPage() {
  const { isPro, loading, access } = useToolPlan('follow-up')
  const history = useToolHistory()
  const [situation, setSituation] = useState('applied')
  const [daysSince, setDaysSince] = useState('10')
  const [contactName, setContactName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [result, setResult] = useState('')
  const [minDays, setMinDays] = useState(10)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/follow-up', {
      situation, daysSince: parseInt(daysSince, 10) || 7, contactName, company, role,
    })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    const data = res.data as { result: string; minDays?: number }
    setResult(data.result)
    setMinDays(data.minDays ?? 10)
    history.bumpHistory()
  }

  const versions = result.split('---VERSION---').map((v) => v.trim()).filter(Boolean)

  if (loading) return null

  return (
    <ToolShell
      title="Follow-Up Email"
      subtitle="Still waiting to hear back? Here's what to send."
      access={access}
      isPro={isPro}
      toolSlug="follow-up"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <span className="dash-tools-label">Situation</span>
          <div className="space-y-2">
            {SITUATIONS.map((s) => (
              <label key={s.id} className="flex items-start gap-2 dash-tools-body cursor-pointer">
                <input type="radio" name="situation" checked={situation === s.id} onChange={() => setSituation(s.id)} className="accent-orange mt-1" />
                {s.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Days since last contact</label>
          <input className="dash-tools-input" type="number" min={1} value={daysSince} onChange={(e) => setDaysSince(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Recruiter / contact name (optional)</label>
          <input className="dash-tools-input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dash-tools-label">Company</label>
            <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="dash-tools-label">Role</label>
            <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write Follow-Up 📬'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {versions.length > 0 && (
        <div className="space-y-4">
          <p className="dash-tools-hint">Timing advice: Only send if it&apos;s been at least {minDays} days.</p>
          {versions.map((v, i) => (
            <div key={i} className="dash-tools-card p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-orange">{['Gentle', 'Direct', 'Final nudge'][i] ?? `Version ${i + 1}`}</h3>
                <CopyButton text={v} label="📋 Copy" />
              </div>
              <pre className="dash-tools-output whitespace-pre-wrap text-sm">{v}</pre>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  )
}
