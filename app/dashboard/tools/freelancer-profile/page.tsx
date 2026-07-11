'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {CopyButton, MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function FreelancerProfilePage() {
  const { isPro, used, limit, loading, access } = useToolPlan('freelancer-profile')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [topSkill, setTopSkill] = useState('')
  const [targetClients, setTargetClients] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/freelancer-profile', { cv, topSkill, targetClients })
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
      title="Freelancer Profile Writer"
      subtitle="CV → Upwork bio + Fiverr gig + Toptal summary — tuned for Indian freelancers"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="freelancer-profile"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Top skill</label>
          <input className="dash-tools-input" value={topSkill} onChange={(e) => setTopSkill(e.target.value)} placeholder="e.g. React development" />
        </div>
        <div>
          <label className="dash-tools-label">Target clients</label>
          <input className="dash-tools-input" value={targetClients} onChange={(e) => setTargetClients(e.target.value)} placeholder="e.g. US startups, D2C brands" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Generate Profiles 💼'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <>
          <div className="flex justify-end"><CopyButton text={result} label="📋 Copy all" /></div>
          <MarkdownBlock content={result} />
        </>
      )}
    </ToolShell>
  )
}
