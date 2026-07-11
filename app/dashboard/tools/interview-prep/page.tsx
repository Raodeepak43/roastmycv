'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { InterviewPrepWizard } from '@/components/dashboard/interview/InterviewPrepWizard'
import {
  StreamingOutput,
  ToolAnalyzingPanel,
  ToolError,
  ToolPaywall,
  ToolShell,
} from '@/components/dashboard/tools/ToolShell'
import { streamToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'

export default function InterviewPrepPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('interview-prep')
  const history = useToolHistory()
  const { cv, hasCv } = useDashboardCv()
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [types, setTypes] = useState<string[]>(['Behavioural', 'Technical', 'CV-specific', 'Situational'])
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const toggleType = (t: string) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await streamToolApi(
      '/api/tools/interview-prep',
      { cv, jobTitle, company, types },
      (chunk) => setResult((prev) => prev + chunk),
    )
    setBusy(false)
    if (res.ok === false) {
      setError(
        res.status === 504 || res.error.toLowerCase().includes('timeout')
          ? 'Generation took too long — try again with a shorter CV or fewer question types.'
          : res.error,
      )
    }
  }

  if (loading) return null

  return (
    <ToolShell
      title="Interview Question Coach"
      subtitle="Get the exact questions they'll ask YOU — based on your CV and the role"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="interview-prep"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <InterviewPrepWizard
        hasCv={hasCv}
        jobTitle={jobTitle}
        onJobTitleChange={setJobTitle}
        company={company}
        onCompanyChange={setCompany}
        types={types}
        onToggleType={toggleType}
        onSubmit={submit}
        busy={busy}
      />
      {busy && <ToolAnalyzingPanel title="Building your personalised question list" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {(result || busy) && !error && (
        <StreamingOutput text={result} loading={busy} title="Your interview questions" analyzingTitle="Building questions" />
      )}
    </ToolShell>
  )
}
