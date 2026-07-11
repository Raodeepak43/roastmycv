'use client'

import { useState } from 'react'
import { MarkdownBlock, ToolAnalyzingPanel, ToolError, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

type ScamData = { verdict: string; confidence: string; redFlags: string[]; explanation: string; advice: string }

function verdictClass(v: string) {
  if (v.toLowerCase().includes('scam')) return 'dash-tools-verdict dash-tools-verdict--scam'
  if (v.toLowerCase().includes('suspicious')) return 'dash-tools-verdict dash-tools-verdict--suspicious'
  return 'dash-tools-verdict dash-tools-verdict--ok'
}

export default function ScamDetectorPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('scam-detector')
  const history = useToolHistory()
  const [posting, setPosting] = useState('')
  const [data, setData] = useState<ScamData | null>(null)
  const [error, setError] = useState('')
  const [historyView, setHistoryView] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setData(null)
    history.bumpHistory()
    const res = await callToolApi('/api/tools/scam-detector', { posting })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setData(res.data as ScamData)
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      needsCv={false}
      title="Job Scam Detector"
      subtitle="Paste a job posting or WhatsApp job message — we'll tell you if it's a scam"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="scam-detector"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => { setData(null); history.loadHistory(text, id, setHistoryView) }}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <textarea
          className="dash-tools-input min-h-[160px] resize-y"
          value={posting}
          onChange={(e) => setPosting(e.target.value)}
          placeholder="Paste the job posting, WhatsApp message, or Telegram ad…"
        />
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Checking…' : 'Detect Scam 🚨'}
        </button>
      </div>
      {historyView && <MarkdownBlock content={historyView} title="Saved result" />}
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {data && (
        <div className="dash-tools-card dash-tools-card--frame p-5 space-y-4">
          <div className={`inline-block ${verdictClass(data.verdict)}`}>
            {data.verdict} ({data.confidence} confidence)
          </div>
          <p className="dash-tools-body">{data.explanation}</p>
          {data.redFlags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Red flags</h3>
              <ul className="space-y-1 text-sm text-red-700">
                {data.redFlags.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
          )}
          <p className="dash-tools-body"><strong className="text-gray-900">Advice:</strong> {data.advice}</p>
        </div>
      )}
    </ToolShell>
  )
}
