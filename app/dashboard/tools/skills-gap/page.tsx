'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { MarkdownBlock, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'

const ANALYSIS_STEPS = [
  'Reading your CV…',
  'Comparing skills to your target role…',
  'Finding gaps employers care about…',
  'Building your learning plan…',
  'Almost done…',
]

export default function SkillsGapPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('skills-gap')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setResult('')
    setBusy(true)
    const res = await callToolApi('/api/tools/skills-gap', { cv, targetRole })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setResult((res.data as { result: string }).result ?? String(res.data))
    history.bumpHistory()
  }

  if (loading) return null

  return (
    <ToolShell
      title="Skills Gap Analyser"
      subtitle="Find out exactly what to learn to land your dream role"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="skills-gap"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      {!busy && (
        <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
          <div>
            <label className="dash-tools-label">What role do you want?</label>
            <input
              className="dash-tools-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Analyst"
            />
          </div>
          <button type="button" className="dash-tools-btn w-full" disabled={!targetRole.trim()} onClick={submit}>
            Analyse My Gaps 🔍
          </button>
        </div>
      )}

      {busy && (
        <ToolAnalyzingPanel
          title="Analysing your skills gap"
          steps={ANALYSIS_STEPS}
        />
      )}

      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}

      {result && !busy && (
        <MarkdownBlock content={result} title="Your skills gap report" />
      )}
    </ToolShell>
  )
}
