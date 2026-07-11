'use client'

import { useState } from 'react'
import {CopyButton, MarkdownBlock, ToolError, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const DURATIONS = ['1-3 months', '3-6 months', '6-12 months', '1-2 years', '2+ years']

export default function GapExplainerPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('gap-explainer')
  const history = useToolHistory()
  const [duration, setDuration] = useState(DURATIONS[2])
  const [reason, setReason] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/gap-explainer', { duration, reason, targetRole })
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
      title="Career Gap Explainer"
      subtitle="Turn your employment gap into a strength — honest answers that don't cost you the job"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="gap-explainer"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">How long was your gap?</label>
          <select className="dash-tools-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="dash-tools-label">What were you doing? (optional)</label>
          <textarea
            className="dash-tools-textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="family care, health, upskilling, travel, freelancing…"
          />
        </div>
        <div>
          <label className="dash-tools-label">What role are you applying for?</label>
          <input className="dash-tools-input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write My Explanation ✍️'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {result && (
        <div className="space-y-3">
          <div className="flex justify-end"><CopyButton text={result} /></div>
          <MarkdownBlock content={result} />
        </div>
      )}
    </ToolShell>
  )
}
