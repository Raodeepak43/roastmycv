'use client'

import { useState } from 'react'
import {MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function CompanyResearchPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('company-research')
  const history = useToolHistory()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/company-research', { company, role, interviewDate })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setResult((res.data as { result: string }).result ?? String(res.data))
  }

  if (loading) return null

  return (
    <ToolShell
      needsCv={false}
      title="Company Research Brief"
      subtitle="Paste company name + role → get a 5-minute pre-interview research brief"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="company-research"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Company name</label>
          <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Razorpay" />
        </div>
        <div>
          <label className="dash-tools-label">Role you're interviewing for</label>
          <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Engineer" />
        </div>
        <div>
          <label className="dash-tools-label">Interview date (optional)</label>
          <input className="dash-tools-input" type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Researching…' : 'Get Research Brief 🔍'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && !busy && <MarkdownBlock content={result} />}
    </ToolShell>
  )
}
