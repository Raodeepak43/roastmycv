'use client'

import { useState } from 'react'
import {MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

export default function OfferComparePage() {
  const { isPro, used, limit, loading, access } = useToolPlan('offer-compare')
  const history = useToolHistory()
  const [offers, setOffers] = useState(['', ''])
  const [salaryNotes, setSalaryNotes] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const addOffer = () => {
    if (offers.length < 3) setOffers([...offers, ''])
  }

  const submit = async () => {
    setError('')
    setBusy(true)
    setResult('')
    history.bumpHistory()
    const res = await callToolApi('/api/tools/offer-compare', { offers, salaryNotes })
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
      title="Job Offer Comparator"
      subtitle="Paste 2-3 job offers — compare salary, growth, culture signals, and get a negotiation script"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="offer-compare"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        {offers.map((o, i) => (
          <div key={i}>
            <label className="dash-tools-label">Offer {i + 1}</label>
            <textarea className="dash-tools-input min-h-[100px] resize-y" value={o} onChange={(e) => {
              const next = [...offers]; next[i] = e.target.value; setOffers(next)
            }} placeholder="Paste offer letter or JD…" />
          </div>
        ))}
        {offers.length < 3 && (
          <button type="button" className="dash-tools-btn--ghost dash-tools-btn text-sm" onClick={addOffer}>+ Add another offer</button>
        )}
        <div>
          <label className="dash-tools-label">Known salary info (optional)</label>
          <input className="dash-tools-input" value={salaryNotes} onChange={(e) => setSalaryNotes(e.target.value)} placeholder="e.g. Offer A: 12 LPA, Offer B: 15 LPA" />
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Comparing…' : 'Compare Offers ⚖️'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') || error.includes('limit') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && !busy && <MarkdownBlock content={result} />}
    </ToolShell>
  )
}
