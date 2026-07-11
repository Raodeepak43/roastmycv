'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { MarkdownBlock, ToolAnalyzingPanel, ToolError, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const COUNTRIES = ['India', 'UK', 'USA', 'UAE', 'Other']

type Flag = { type: string; found: string; reveals: string; risk: string; neutralise: string }

function riskClass(risk: string) {
  if (risk === 'High') return 'dash-tools-risk dash-tools-risk--high'
  if (risk === 'Medium') return 'dash-tools-risk dash-tools-risk--medium'
  return 'dash-tools-risk dash-tools-risk--low'
}

export default function BiasCheckPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('bias-check')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [country, setCountry] = useState('India')
  const [flags, setFlags] = useState<Flag[]>([])
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [historyView, setHistoryView] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setFlags([])
    setSummary('')
    const res = await callToolApi('/api/tools/bias-check', { cv, country })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    const data = res.data as { flags: Flag[]; summary: string }
    setFlags(data.flags ?? [])
    setSummary(data.summary ?? '')
    setHistoryView('')
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      title="HR Bias Detector"
      subtitle="Find what in your CV might trigger unconscious bias — before a recruiter does"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="bias-check"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => { setFlags([]); setSummary(''); history.loadHistory(text, id, setHistoryView) }}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <p className="dash-tools-hint leading-relaxed">
          We check for signals that reveal age, religion, caste, college tier, gender, or family status — things that should not matter but sometimes do. We never store this data.
        </p>
        <div>
          <label className="dash-tools-label">Target country</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {COUNTRIES.map((c) => (
              <button key={c} type="button" onClick={() => setCountry(c)} className={`dash-tools-chip ${country === c ? 'dash-tools-chip--active' : ''}`}>{c}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Scanning…' : 'Scan for Bias Triggers 🕵️'}
        </button>
      </div>
      {historyView && <MarkdownBlock content={historyView} title="Saved result" />}
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {summary && <p className="dash-tools-body">{summary}</p>}
      {flags.length > 0 && (
        <div className="space-y-3">
          {flags.map((f, i) => (
            <div key={i} className="dash-tools-card dash-tools-card--frame p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 text-sm">{f.type}</span>
                <span className={`text-xs px-2 py-0.5 border rounded ${riskClass(f.risk)}`}>{f.risk}</span>
              </div>
              <p className="dash-tools-body"><strong className="text-gray-900">Found:</strong> {f.found}</p>
              <p className="dash-tools-hint">{f.reveals}</p>
              <p className="dash-tools-body"><strong className="text-green-600">Neutralise:</strong> {f.neutralise}</p>
            </div>
          ))}
          <p className="dash-tools-hint italic">
            These are signals that SHOULD NOT matter in hiring. We flag them so you can decide whether to remove them — not because they define your value.
          </p>
        </div>
      )}
      {flags.length === 0 && summary && !busy && (
        <div className="dash-tools-card p-4 text-sm text-green-600">No major bias triggers found.</div>
      )}
    </ToolShell>
  )
}
