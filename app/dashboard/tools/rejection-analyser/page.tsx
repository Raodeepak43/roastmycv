'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function RejectionAnalyserPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('rejection-analyser')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [jds, setJds] = useState(['', '', ''])
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const addJd = () => {
    if (jds.length < 5) setJds([...jds, ''])
  }

  const updateJd = (i: number, val: string) => {
    const next = [...jds]
    next[i] = val
    setJds(next)
  }

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/rejection-analyser', { cv, jobDescriptions: jds })
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
      title="Why Am I Getting Rejected?"
      subtitle="Paste 3-5 job descriptions you applied to and didn't get a response. AI finds the pattern."
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="rejection-analyser"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        {jds.map((jd, i) => (
          <div key={i}>
            <label className="dash-tools-label">Job Description {i + 1}</label>
            <textarea
              className="dash-tools-input min-h-[100px] resize-y"
              value={jd}
              onChange={(e) => updateJd(i, e.target.value)}
              placeholder="Paste the full job description…"
            />
          </div>
        ))}
        {jds.length < 5 && (
          <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-sm" onClick={addJd}>
            + Add another JD
          </button>
        )}
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Analysing…' : 'Find My Pattern 🔎'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <>
          <MarkdownBlock content={result} />
          <div className="dash-tools-card p-4 flex flex-wrap gap-3">
            <Link href="/dashboard/tools/cv-rewriter" className="dash-tools-btn text-sm">Fix it now → CV Rewriter</Link>
            <Link href="/dashboard/tools/jd-match" className="dash-tools-btn--ghost dash-tools-btn text-sm">Check your next application → JD Matcher</Link>
          </div>
        </>
      )}
    </ToolShell>
  )
}
