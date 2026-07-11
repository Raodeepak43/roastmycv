'use client'

import { useCallback, useEffect, useState, Fragment } from 'react'
import Link from 'next/link'
import type { ApplicationStatus, JobApplicationRow } from '@/lib/dashboard/job-applications'
import { daysSince } from '@/lib/dashboard/job-applications'

type Filter = 'all' | 'active' | 'interviews' | 'offers'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const EMPTY_FORM = {
  company: '',
  role: '',
  date_applied: new Date().toISOString().slice(0, 10),
  status: 'applied' as ApplicationStatus,
  notes: '',
  job_url: '',
}

export default function TrackerPage() {
  const [applications, setApplications] = useState<JobApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stats = {
    applied: applications.filter((a) => a.status === 'applied').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offer: applications.filter((a) => a.status === 'offer').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  const filtered = applications.filter((a) => {
    if (filter === 'active') return !['rejected', 'withdrawn', 'offer'].includes(a.status)
    if (filter === 'interviews') return a.status === 'interview'
    if (filter === 'offers') return a.status === 'offer'
    return true
  })

  const save = async () => {
    setError('')
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role required')
      return
    }
    const url = editId ? `/api/dashboard/applications/${editId}` : '/api/dashboard/applications'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Save failed')
      return
    }
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await fetch(`/api/dashboard/applications/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (row: JobApplicationRow) => {
    setEditId(row.id)
    setForm({
      company: row.company,
      role: row.role,
      date_applied: row.date_applied,
      status: row.status,
      notes: row.notes ?? '',
      job_url: row.job_url ?? '',
    })
    setShowForm(true)
  }

  return (
    <div className="dash-tools max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="dash-tools-title">Application Tracker</h1>
        <p className="dash-tools-subtitle mt-1">Track every job you apply to. Know exactly where you stand.</p>
      </header>

      <div className="dash-tracker-stats">
        <span>{stats.applied} applied</span>
        <span>·</span>
        <span>{stats.interview} interviews</span>
        <span>·</span>
        <span>{stats.offer} offers</span>
        <span>·</span>
        <span>{stats.rejected} rejected</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'active', 'interviews', 'offers'] as Filter[]).map((f) => (
          <button key={f} type="button" className={`dash-tools-chip capitalize ${filter === f ? 'dash-tools-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <button type="button" className="dash-tools-btn text-sm ml-auto" onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(EMPTY_FORM) }}>
          + Add Application
        </button>
      </div>

      {showForm && (
        <div className="dash-tools-card dash-tools-card--frame p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="dash-tools-label">Company</label>
              <input className="dash-tools-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="dash-tools-label">Role</label>
              <input className="dash-tools-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label className="dash-tools-label">Date applied</label>
              <input className="dash-tools-input" type="date" value={form.date_applied} onChange={(e) => setForm({ ...form, date_applied: e.target.value })} />
            </div>
            <div>
              <label className="dash-tools-label">Status</label>
              <select className="dash-tools-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="dash-tools-label">Job URL (optional)</label>
            <input className="dash-tools-input" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} />
          </div>
          <div>
            <label className="dash-tools-label">Notes</label>
            <textarea className="dash-tools-textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="dash-tools-btn" onClick={save}>{editId ? 'Update' : 'Save'}</button>
            <button type="button" className="dash-tools-btn--ghost dash-tools-btn" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="dash-tracker-table-wrap dash-tools-card--frame">
        {loading ? (
          <p className="p-8 text-center dash-tools-hint text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center dash-tools-hint text-sm">No applications yet. Add your first one above.</p>
        ) : (
          <table className="dash-tracker-table w-full text-sm">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const stale = row.status === 'applied' && daysSince(row.date_applied) >= 14
                const expanded = expandedId === row.id
                return (
                  <Fragment key={row.id}>
                    <tr className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : row.id)}>
                      <td className="font-medium text-gray-900">
                        {row.company}
                        {stale && (
                          <Link href="/dashboard/tools/follow-up" className="ml-2 text-amber-600 text-xs" title="Follow up" onClick={(e) => e.stopPropagation()}>
                            ⚠️ Follow up?
                          </Link>
                        )}
                      </td>
                      <td>{row.role}</td>
                      <td className="tabular-nums dash-tools-hint">{row.date_applied}</td>
                      <td><span className={`dash-tracker-badge dash-tracker-badge--${row.status}`}>{STATUS_LABELS[row.status]}</span></td>
                      <td className="max-w-[120px] truncate dash-tools-hint">{row.notes || '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="text-xs text-orange mr-2" onClick={() => startEdit(row)}>Edit</button>
                        <button type="button" className="dash-tools-hint hover:text-red-600" onClick={() => remove(row.id)}>Delete</button>
                      </td>
                    </tr>
                    {expanded && row.notes && (
                      <tr className="dash-tracker-expand">
                        <td colSpan={6} className="dash-tools-hint text-xs p-3 pl-4">{row.notes}</td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {filtered.some((r) => r.status === 'applied' && daysSince(r.date_applied) >= 14) && (
        <p className="dash-tools-hint">
          ⚠️ Applications with no update in 14+ days —{' '}
          <Link href="/dashboard/tools/follow-up" className="text-orange hover:underline">write a follow-up</Link>
        </p>
      )}
    </div>
  )
}
