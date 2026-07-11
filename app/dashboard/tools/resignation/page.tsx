'use client'

import { useState } from 'react'
import {CopyButton, MarkdownBlock, ToolError, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const TONES = [
  { id: 'formal', label: 'Formal' },
  { id: 'warm', label: 'Warm' },
  { id: 'graceful', label: 'Burning bridges gracefully' },
]

export default function ResignationPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('resignation')
  const history = useToolHistory()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [lastDay, setLastDay] = useState('')
  const [tone, setTone] = useState('formal')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/resignation', { name, role, company, lastDay, tone })
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
      needsCv={false}
      title="Resignation Letter"
      subtitle="Professional resignation letter + counter-offer advice + handover checklist"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="resignation"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="dash-tools-label">Your name</label>
            <input className="dash-tools-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="dash-tools-label">Role</label>
            <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Company</label>
          <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="dash-tools-label">Last working day</label>
          <input className="dash-tools-input" value={lastDay} onChange={(e) => setLastDay(e.target.value)} placeholder="e.g. 15 July 2026 or 2 weeks notice" />
        </div>
        <div>
          <label className="dash-tools-label">Tone</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {TONES.map((t) => (
              <button key={t.id} type="button" onClick={() => setTone(t.id)} className={`dash-tools-chip ${tone === t.id ? 'dash-tools-chip--active' : ''}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Generate Letter ✍️'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {result && (
        <>
          <div className="flex justify-end"><CopyButton text={result} label="📋 Copy all" /></div>
          <MarkdownBlock content={result} />
        </>
      )}
    </ToolShell>
  )
}
