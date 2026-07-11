'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const PRIORITIES = [
  'Higher salary',
  'Work-life balance',
  'Faster growth',
  'Remote work',
  'Leadership',
  'Switching industry',
]

export default function CareerPathPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('career-path')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [priorities, setPriorities] = useState<string[]>([])
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const toggle = (p: string) => {
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/career-path', { cv, priorities })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  const paths = result.split('---PATH---').map((p) => p.trim()).filter(Boolean)

  if (loading) return null

  return (
    <ToolShell
      title="Where Can You Go From Here?"
      subtitle="3 realistic career paths based on your experience — 2 and 5 year roadmaps"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="career-path"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <span className="dash-tools-label">What matters most to you?</span>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button key={p} type="button" className={`dash-tools-chip ${priorities.includes(p) ? 'dash-tools-chip--active' : ''}`} onClick={() => toggle(p)}>{p}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Mapping…' : 'Explore My Paths 🗺️'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {paths.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {paths.map((path, i) => (
            <div key={i} className="dash-tools-card dash-tools-card--frame p-5">
              <MarkdownBlock content={path} />
            </div>
          ))}
        </div>
      )}
      {result && paths.length === 0 && <MarkdownBlock content={result} />}
    </ToolShell>
  )
}
