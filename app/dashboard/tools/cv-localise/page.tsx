'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {CopyButton, MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const COUNTRIES = [
  { id: 'usa', flag: '🇺🇸', label: 'USA' },
  { id: 'uk', flag: '🇬🇧', label: 'UK' },
  { id: 'germany', flag: '🇩🇪', label: 'Germany' },
  { id: 'canada', flag: '🇨🇦', label: 'Canada' },
  { id: 'australia', flag: '🇦🇺', label: 'Australia' },
  { id: 'singapore', flag: '🇸🇬', label: 'Singapore' },
  { id: 'uae', flag: '🇦🇪', label: 'UAE' },
  { id: 'netherlands', flag: '🇳🇱', label: 'Netherlands' },
]

export default function CvLocalisePage() {
  const { isPro, used, limit, loading, access } = useToolPlan('cv-localise')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [targetCountry, setTargetCountry] = useState('uk')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const localisedCv = result.split('## Your localised CV')[1]?.trim() ?? ''
  const changes = result.split('## Your localised CV')[0]?.trim() ?? result

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/cv-localise', { cv, targetCountry })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setResult((res.data as { result: string }).result)
  }

  const download = () => {
    if (!localisedCv) return
    const blob = new Blob([localisedCv], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cv-${targetCountry}.txt`
    a.click()
  }

  if (loading) return null

  return (
    <ToolShell
      title="CV Localiser"
      subtitle="Your CV for the UK job market is different from the US or Germany. Get the right version."
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="cv-localise"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div>
          <label className="dash-tools-label">Target country</label>
          <select className="dash-tools-input" value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>{c.flag} {c.label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Localising…' : 'Localise My CV 🌍'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h3 className="dash-tools-label mb-3">Changes to make</h3>
            <MarkdownBlock content={changes} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="dash-tools-label">Your localised CV</h3>
              <div className="flex gap-2">
                {localisedCv && <CopyButton text={localisedCv} />}
                {localisedCv && (
                  <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-xs py-2" onClick={download}>Download .txt</button>
                )}
              </div>
            </div>
            <pre className="dash-tools-output whitespace-pre-wrap text-sm max-h-[600px] overflow-y-auto">{localisedCv || result}</pre>
          </div>
        </div>
      )}
    </ToolShell>
  )
}
