'use client'

import { useEffect, useState } from 'react'
import { extractBulletsFromCv } from '@/components/dashboard/tools/CvInput'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { CopyButton, MarkdownBlock, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

type Row = { original: string; rewritten: string }

export default function CvRewriterPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('cv-rewriter')
  const history = useToolHistory()
  const { cv, hasCv } = useDashboardCv()
  const [bullets, setBullets] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [principles, setPrinciples] = useState<string[]>([])
  const [error, setError] = useState('')
  const [historyView, setHistoryView] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!hasCv || bullets.trim()) return
    const extracted = extractBulletsFromCv(cv)
    if (extracted.length > 0) setBullets(extracted.join('\n'))
  }, [hasCv, cv, bullets])

  const submit = async () => {
    setError('')
    setBusy(true)
    const list = bullets.split('\n').map((b) => b.trim()).filter(Boolean)
    const res = await callToolApi('/api/tools/cv-rewriter', { bullets: list, targetRole })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    const data = res.data as { rows: Row[]; principles: string[] }
    setRows(data.rows ?? [])
    setPrinciples(data.principles ?? [])
  }

  const allRewritten = rows.map((r) => r.rewritten).join('\n')

  if (loading) return null

  return (
    <ToolShell
      title="CV Bullet Rewriter"
      subtitle="Turn weak CV bullets into strong, metric-led, ATS-optimised lines"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="cv-rewriter"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => { setRows([]); setPrinciples([]); history.loadHistory(text, id, setHistoryView) }}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Bullets to rewrite (one per line)</label>
          <textarea className="dash-tools-textarea" rows={8} value={bullets} onChange={(e) => setBullets(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Target role (optional)</label>
          <input className="dash-tools-input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Product Manager" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy || !bullets.trim()} onClick={submit}>
          {busy ? 'Rewriting…' : 'Rewrite My Bullets ✨'}
        </button>
      </div>
      {historyView && <MarkdownBlock content={historyView} title="Saved result" />}
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('limit') || error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="dash-tools-table-wrap dash-tools-card--frame">
            <table className="dash-tools-table">
              <thead>
                <tr>
                  <th>Original</th>
                  <th>Rewritten</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="dash-tools-hint">{row.original}</td>
                    <td>
                      <p className="text-gray-900 mb-2">{row.rewritten}</p>
                      <CopyButton text={row.rewritten} label="Copy" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {principles.length > 0 && (
            <div className="dash-tools-card p-5">
              <h3 className="dash-tools-label">What changed</h3>
              <ul className="list-disc pl-5 dash-tools-body space-y-1">
                {principles.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          <CopyButton text={allRewritten} label="📋 Copy all rewritten bullets" />
        </div>
      )}
    </ToolShell>
  )
}
