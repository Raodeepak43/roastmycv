'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { CopyButton, ToolAnalyzingPanel, ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const TONES = [
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'achievement', label: 'Achievement-led' },
  { id: 'keyword', label: 'Keyword-rich' },
] as const

const ANALYSIS_STEPS = [
  'Reading your CV…',
  'Extracting your best achievements…',
  'Writing LinkedIn summary versions…',
  'Polishing tone and keywords…',
  'Almost done…',
]

export default function LinkedInWriterPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('linkedin')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [tone, setTone] = useState<(typeof TONES)[number]['id']>('storytelling')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setResult('')
    history.bumpHistory()
    setBusy(true)
    const res = await callToolApi('/api/tools/linkedin', { cv, tone })
    setBusy(false)
    if (res.ok === false) {
      setError(res.error)
      return
    }
    setResult((res.data as { result: string }).result)
  }

  const versions = result.split('---VERSION---').map((v) => v.trim()).filter(Boolean)

  if (loading) return null

  return (
    <ToolShell
      title="LinkedIn Summary Writer"
      subtitle="Turn your CV into a LinkedIn About section that actually gets you noticed"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="linkedin"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      {!busy && !versions.length && (
        <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
          <div>
            <span className="dash-tools-label">Tone</span>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`dash-tools-chip ${tone === t.id ? 'dash-tools-chip--active' : ''}`}
                  onClick={() => setTone(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="dash-tools-btn w-full" onClick={submit}>
            Write my LinkedIn Summary ✍️
          </button>
        </div>
      )}

      {busy && (
        <ToolAnalyzingPanel title="Writing your LinkedIn summary" steps={ANALYSIS_STEPS} />
      )}

      {error && (error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}

      {versions.length > 0 && !busy && (
        <div className="tool-result">
          <div className="tool-result__header">
            <div>
              <p className="tool-result__eyebrow">Analysis complete</p>
              <h2 className="tool-result__title">LinkedIn summary options</h2>
            </div>
            <span className="tool-result__count">{versions.length} versions</span>
          </div>
          <div className="tool-result__sections">
            {versions.map((v, i) => (
              <article key={i} className="tool-result__card">
                <header className="tool-result__card-head">
                  <div className="tool-result__card-title-wrap">
                    <span className="tool-result__card-num">{i + 1}</span>
                    <h3 className="tool-result__card-title">Version {i + 1}</h3>
                  </div>
                  <CopyButton text={v} label="Copy" />
                </header>
                <div className="tool-result__body whitespace-pre-wrap">{v}</div>
              </article>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  )
}
