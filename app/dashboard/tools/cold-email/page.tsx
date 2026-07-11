'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function ColdEmailPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('cold-email')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [recruiterName, setRecruiterName] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/cold-email', { cv, role, company, recruiterName })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setResult((res.data as { result: string }).result)
  }

  if (loading) return null

  return (
    <ToolShell
      title="Cold Email to Recruiters"
      subtitle="A short, specific email that gets replies — not the bin"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="cold-email"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">What role are you targeting?</label>
          <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Company name</label>
          <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Recruiter&apos;s name if known</label>
          <input className="dash-tools-input" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="Optional" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={generate}>
          {busy ? 'Writing…' : 'Write My Email 📧'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <CopyButton text={result} label="📋 Copy full email" />
            <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={generate}>Regenerate</button>
          </div>
          <pre className="dash-tools-output whitespace-pre-wrap">{result}</pre>
          <p className="dash-tools-hint">Pro tip: Send on Tuesday–Thursday, 9–11am. Follow up once after 5 days.</p>
        </div>
      )}
    </ToolShell>
  )
}
