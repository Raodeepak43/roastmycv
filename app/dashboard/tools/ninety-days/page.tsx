'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function NinetyDaysPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('ninety-days')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [role, setRole] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/ninety-days', { cv, role, companyType })
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
      title="First 90 Days Plan"
      subtitle="You got the job — now what? CV + role → 30/60/90 day onboarding plan"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="ninety-days"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">New role</label>
          <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Product Manager" />
        </div>
        <div>
          <label className="dash-tools-label">Company size / type</label>
          <input className="dash-tools-input" value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="e.g. Series B startup, 200 employees" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Planning…' : 'Build My 90-Day Plan 🚀'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && !busy && <MarkdownBlock content={result} />}
    </ToolShell>
  )
}
