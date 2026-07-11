'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { CopyButton, MarkdownBlock, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

type CompressData = {
  cut: { item: string; reason: string }[]
  compressedCv: string
  restoreRanked: { item: string; reason: string }[]
}

export default function CompressPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('compress')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [targetRole, setTargetRole] = useState('')
  const [data, setData] = useState<CompressData | null>(null)
  const [error, setError] = useState('')
  const [historyView, setHistoryView] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setData(null)
    history.bumpHistory()
    const res = await callToolApi('/api/tools/compress', { cv, targetRole })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setData(res.data as CompressData)
    history.bumpHistory()
  }

  const downloadTxt = () => {
    if (!data?.compressedCv) return
    const blob = new Blob([data.compressedCv], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compressed-cv.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return null

  return (
    <ToolShell
      title="1-Page Resume Compressor"
      subtitle="Recruiters spend 6 seconds on your CV. One page forces you to show only what matters."
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="compress"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => { setData(null); history.loadHistory(text, id, setHistoryView) }}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <p className="dash-tools-hint">{cv.length} characters</p>
        <div>
          <label className="dash-tools-label">Target role</label>
          <input
            className="dash-tools-input"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Product Manager"
          />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Compressing…' : 'Compress to 1 Page ✂️'}
        </button>
      </div>
      {historyView && <MarkdownBlock content={historyView} title="Saved result" />}
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {data && (
        <div className="space-y-5">
          <div className="dash-tools-card dash-tools-card--frame p-5">
            <h2 className="dash-tools-section-title">What was cut & why</h2>
            <ul className="space-y-2 dash-tools-body">
              {data.cut.map((c, i) => (
                <li key={i}><strong className="text-gray-900">Removed:</strong> {c.item} — <em>{c.reason}</em></li>
              ))}
            </ul>
          </div>
          <div className="dash-tools-card dash-tools-card--frame p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="dash-tools-section-title">Your 1-page CV</h2>
              <div className="flex gap-2">
                <CopyButton text={data.compressedCv} />
                <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2 px-3" onClick={downloadTxt}>
                  ⬇ Download .txt
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap dash-tools-body font-body">{data.compressedCv}</pre>
          </div>
          <div className="dash-tools-card dash-tools-card--frame p-5">
            <h2 className="dash-tools-section-title">What to put back if you have space</h2>
            <ol className="space-y-2 dash-tools-body list-decimal pl-5">
              {data.restoreRanked.map((r, i) => (
                <li key={i}><strong className="text-gray-900">{r.item}</strong> — {r.reason}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </ToolShell>
  )
}
