'use client'

import { useState } from 'react'
import {MarkdownBlock, ToolError, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const TYPES = ['HR screening', 'Technical round', 'Managerial', 'Final round']
const FEELINGS = ['Confident', 'Unsure', 'It went badly']

export default function DebriefPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('debrief')
  const history = useToolHistory()
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [interviewType, setInterviewType] = useState(TYPES[0])
  const [description, setDescription] = useState('')
  const [feeling, setFeeling] = useState(FEELINGS[1])
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/debrief', { role, company, interviewType, description, feeling })
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
      title="Interview Debrief"
      subtitle="Describe what happened. AI tells you what went wrong and what to do next time."
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="debrief"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="dash-tools-label">Role</label>
            <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label className="dash-tools-label">Company</label>
            <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Interview type</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setInterviewType(t)} className={`dash-tools-chip ${interviewType === t ? 'dash-tools-chip--active' : ''}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Describe your interview</label>
          <textarea
            className="dash-tools-input min-h-[160px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What questions were asked, how you answered, how it felt…"
          />
          <p className="dash-tools-hint mt-1">{description.length} chars (min 100)</p>
        </div>
        <div>
          <label className="dash-tools-label">How do you feel it went?</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {FEELINGS.map((f) => (
              <button key={f} type="button" onClick={() => setFeeling(f)} className={`dash-tools-chip ${feeling === f ? 'dash-tools-chip--active' : ''}`}>{f}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Debriefing…' : 'Debrief My Interview 🎭'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && <ToolError message={error} />}
      {result && !busy && <MarkdownBlock content={result} />}
    </ToolShell>
  )
}
