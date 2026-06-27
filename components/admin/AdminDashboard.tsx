'use client'

import { useEffect, useState } from 'react'
import { Flame, Mail, Users, Gauge, type LucideIcon } from 'lucide-react'
import type { AdminOverview } from '@/lib/admin/data'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string
  value: number
  icon: LucideIcon
  hint?: string
}) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card-top">
        <span className="admin-stat-label">{title}</span>
        <Icon size={16} />
      </div>
      <div className="admin-stat-value">{value.toLocaleString()}</div>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  )
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/data', { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Request failed')
        setData(json)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="admin-loading">Loading dashboard…</p>
  }

  if (error || !data) {
    return (
      <div className="admin-error-box">
        {error || 'Failed to load dashboard data. Try logging in again.'}
      </div>
    )
  }

  return (
    <div className="admin-stack">
      <div className="admin-stats-grid">
        <StatCard title="Total Roasts" value={data.roastCount} icon={Flame} hint="All-time counter" />
        <StatCard title="Email Signups" value={data.emailSignups} icon={Mail} />
        <StatCard title="Ticker Signups" value={data.tickerSignups} icon={Users} />
        <StatCard title="Usage Records" value={data.usageRows} icon={Gauge} hint="Browser fingerprints" />
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Recent Ticker Signups</h2>
            <p>Names shown on the live ticker</p>
          </div>
          <div className="admin-panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTicker.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">
                      No signups yet
                    </td>
                  </tr>
                ) : (
                  data.recentTicker.map((row, i) => (
                    <tr key={i}>
                      <td><strong>{row.name}</strong></td>
                      <td>
                        {row.score != null ? (
                          <span className="admin-badge">{row.score}/10</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="admin-muted">{formatDate(row.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Recent Emails</h2>
            <p>Newsletter / join list captures</p>
          </div>
          <div className="admin-panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEmails.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="empty">
                      No emails yet
                    </td>
                  </tr>
                ) : (
                  data.recentEmails.map((row, i) => (
                    <tr key={i}>
                      <td>{row.email}</td>
                      <td className="admin-muted">{formatDate(row.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Top Usage (Free Limit)</h2>
          <p>Fingerprints with highest roast counts</p>
        </div>
        <div className="admin-panel-body">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fingerprint</th>
                <th>Used</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsage.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty">
                    No usage data
                  </td>
                </tr>
              ) : (
                data.topUsage.map((row) => (
                  <tr key={row.fingerprint}>
                    <td className="admin-mono">{row.fingerprint.slice(0, 20)}…</td>
                    <td>
                      <span className={`admin-badge${row.used_count >= 5 ? ' warn' : ''}`}>
                        {row.used_count}/5
                      </span>
                    </td>
                    <td className="admin-muted">{formatDate(row.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
