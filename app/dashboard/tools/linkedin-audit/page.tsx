'use client'

import { useMemo, useState } from 'react'
import {CopyButton, MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

function parseOverallScore(text: string): number | null {
  const m = text.match(/Overall Score[^\d]*(\d{1,3})\s*\/\s*100/i) ?? text.match(/(\d{1,3})\s*\/\s*100/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return n >= 0 && n <= 100 ? n : null
}

function scoreColor(n: number) {
  if (n < 50) return '#e24b4a'
  if (n < 75) return '#eda100'
  return '#0ca30c'
}

export default function LinkedInAuditPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('linkedin-audit')
  const history = useToolHistory()
  const [profileText, setProfileText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const score = useMemo(() => (result ? parseOverallScore(result) : null), [result])

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/linkedin-audit', { profileText, targetRole })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      needsCv={false}
      title="LinkedIn Profile Audit"
      subtitle="Your full profile scored — headline to recommendations"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="linkedin-audit"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Paste your full LinkedIn profile text</label>
          <textarea
            className="dash-tools-textarea min-h-[200px]"
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="On LinkedIn: click your profile → select all text → paste here"
          />
        </div>
        <div>
          <label className="dash-tools-label">What role are you trying to attract?</label>
          <input className="dash-tools-input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Auditing…' : 'Audit My Profile 🔍'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="space-y-4">
          {score !== null && (
            <div className="dash-tools-card p-8 text-center">
              <p className="dash-tools-label mb-2">Overall score</p>
              <p className="text-6xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>
                {score}<span className="text-2xl dash-tools-hint">/100</span>
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <CopyButton text={result} label="📋 Copy full audit" />
          </div>
          <MarkdownBlock content={result} />
        </div>
      )}
    </ToolShell>
  )
}
