'use client'

import { useState } from 'react'
import {CopyButton, MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function SalaryScriptPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('salary')
  const history = useToolHistory()
  const [currentOffer, setCurrentOffer] = useState('')
  const [targetSalary, setTargetSalary] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/salary', {
      currentOffer,
      targetSalary,
      yearsExp: yearsExp ? parseInt(yearsExp, 10) : undefined,
      role,
      location,
    })
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
      needsCv={false}
      title="Salary Negotiation Script"
      subtitle="Know exactly what to say when they ask 'what are your expectations?'"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="salary"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">What&apos;s the offer on the table? (₹ per year, optional)</label>
          <input className="dash-tools-input" value={currentOffer} onChange={(e) => setCurrentOffer(e.target.value)} placeholder="e.g. 1200000" />
        </div>
        <div>
          <label className="dash-tools-label">What do you want? (₹ per year)</label>
          <input className="dash-tools-input" value={targetSalary} onChange={(e) => setTargetSalary(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Years of experience</label>
          <input className="dash-tools-input" type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Role</label>
          <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">City / Remote</label>
          <input className="dash-tools-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write My Script 💰'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="space-y-3">
          <CopyButton text={result} label="📋 Copy all" />
          <MarkdownBlock content={result} />
        </div>
      )}
    </ToolShell>
  )
}
