'use client'

import { useMemo, useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { StreamingOutput, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { streamToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

function parseScore(text: string): number | null {
  const m = text.match(/ATS Match Score[^\d]*(\d{1,3})/i) ?? text.match(/(\d{1,3})\s*\/\s*100/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return n >= 0 && n <= 100 ? n : null
}

function scoreColor(n: number) {
  if (n < 50) return '#e24b4a'
  if (n < 75) return '#eda100'
  return '#0ca30c'
}

export default function JdMatchPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('jd-match')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [jd, setJd] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const score = useMemo(() => parseScore(result), [result])

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await streamToolApi('/api/tools/jd-match', { cv, jobDescription: jd }, (chunk) => {
      setResult((prev) => prev + chunk)
    })
    setBusy(false)
    if (res.ok === false) setError(res.error)
  }

  if (loading) return null

  return (
    <ToolShell
      title="Job Description Matcher"
      subtitle="Paste a job description → see how well your CV matches and exactly what to fix"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="jd-match"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Paste the job description here</label>
          <textarea className="dash-tools-textarea" rows={8} value={jd} onChange={(e) => setJd(e.target.value)} />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Analysing…' : 'Analyse Match 🎯'}
        </button>
      </div>
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {(result || busy) && (
        <div className="space-y-4">
          {score !== null && (
            <div className="dash-tools-card p-8 text-center">
              <p className="dash-tools-label mb-2">ATS Match Score</p>
              <p className="text-6xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>
                {score}<span className="text-2xl dash-tools-hint">/100</span>
              </p>
            </div>
          )}
          <StreamingOutput
            text={result}
            loading={busy}
            title="Match analysis"
            analyzingTitle="Analysing job description match"
          />
        </div>
      )}
    </ToolShell>
  )
}
