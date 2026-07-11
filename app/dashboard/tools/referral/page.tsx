'use client'

import { useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import {CopyButton, MarkdownBlock, ToolError, ToolPaywall, ToolShell, ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, useToolPlan , useToolHistory } from '@/components/dashboard/tools/useToolPlan'

const RELATIONSHIPS = [
  { id: 'friend', label: 'College friend' },
  { id: 'colleague', label: 'Ex-colleague' },
  { id: 'linkedin', label: "LinkedIn connection (don't know well)" },
  { id: 'senior', label: "Senior I've never spoken to" },
]

const PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'linkedin', label: 'LinkedIn DM' },
  { id: 'email', label: 'Email' },
]

export default function ReferralPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('referral')
  const history = useToolHistory()
  const { cv } = useDashboardCv()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [relationship, setRelationship] = useState('linkedin')
  const [contactName, setContactName] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await callToolApi('/api/tools/referral', { cv, company, role, relationship, contactName, platform })
    setBusy(false)
    if (res.ok === false) { setError(res.error); return }
    setResult((res.data as { result: string }).result)
    history.bumpHistory()
  }

  const messagePart = result.split('## Do')[0]?.trim() ?? result

  if (loading) return null

  return (
    <ToolShell
      title="Ask for a Referral"
      subtitle="The right message to a connection — without making it awkward"
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      toolSlug="referral"
      historyRefresh={history.refreshKey}
      historyActiveId={history.activeId}
      onHistoryLoad={(text, id) => history.loadHistory(text, id, setResult)}
    >
      <div className="dash-tools-card dash-tools-card--frame p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dash-tools-label">Target company</label>
            <input className="dash-tools-input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="dash-tools-label">Target role</label>
            <input className="dash-tools-input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <div>
          <span className="dash-tools-label">Your relationship</span>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <button key={r.id} type="button" className={`dash-tools-chip ${relationship === r.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setRelationship(r.id)}>{r.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="dash-tools-label">Contact&apos;s name (optional)</label>
          <input className="dash-tools-input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <span className="dash-tools-label">Platform</span>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} type="button" className={`dash-tools-chip ${platform === p.id ? 'dash-tools-chip--active' : ''}`} onClick={() => setPlatform(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="dash-tools-btn w-full" disabled={busy} onClick={submit}>
          {busy ? 'Writing…' : 'Write My Referral Request 🤝'}
        </button>
      </div>
      {busy && <ToolAnalyzingPanel title="Working on your request" />}
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      {result && (
        <div className="space-y-4">
          <CopyButton text={messagePart} label="📋 Copy message" />
          <pre className="dash-tools-output whitespace-pre-wrap">{messagePart}</pre>
          {result.includes("Do's") && <MarkdownBlock content={result.slice(result.indexOf('## Do'))} />}
          <div className="dash-tools-card p-4 dash-tools-body">
            <strong className="text-gray-900">Do:</strong> make it easy for them to say yes.<br />
            <strong className="text-gray-900">Don&apos;t:</strong> send your CV without being asked first.
          </div>
        </div>
      )}
    </ToolShell>
  )
}
