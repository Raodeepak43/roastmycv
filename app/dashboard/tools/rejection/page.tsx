'use client'

import { useState } from 'react'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'

const STAGES = [
  { id: 'screening', label: 'After CV screening' },
  { id: 'first', label: 'After first interview' },
  { id: 'final', label: 'After final round' },
]

const GOALS = [
  { id: 'feedback', label: 'Ask for feedback' },
  { id: 'future', label: 'Keep door open for future' },
  { id: 'both', label: 'Both' },
]

export default function RejectionPage() {
  const { isPro, loading, access } = useToolPlan('rejection')
  const history = useToolHistory()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [stage, setStage] = useState('screening')
  const [goal, setGoal] = useState('both')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/rejection', { company, role, stage, goal })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      title="Rejection Response"
      subtitle="Reply gracefully. Ask for feedback. Keep the door open."
      access={access}
      isPro={isPro}
      toolSlug="rejection"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
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
        <div>
          <span className="dash-tools-label">Stage of rejection</span>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button key={s.id} type="button" className={`dash-tools-chip ${stage === s.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setStage(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="dash-tools-label">Goal</span>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button key={g.id} type="button" className={`dash-tools-chip ${goal === g.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setGoal(g.id)}>{g.label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write My Reply 💌'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {result && (
        <div className="space-y-3">
          <CopyButton text={result} label="📋 Copy reply" />
          <pre className="dash-tools-output whitespace-pre-wrap">{result}</pre>
          <p className="dash-tools-hint">Why reply? 80% of hiring managers respect candidates who respond gracefully. 20% have re-hired them later.</p>
        </div>
      )}
    </ToolShell>
  )
}
