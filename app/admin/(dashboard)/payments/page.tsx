'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'

type Row = {
  id: string
  userId: string
  email: string | null
  razorpayPaymentId: string
  amountInr: number
  plan: string
  status: string
  createdAt: string
  source?: 'db' | 'razorpay'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/data?view=payments', { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load')
      setRows(json.rows ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const sync = async () => {
    setSyncing(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/payments/sync', {
        method: 'POST',
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Sync failed')
      setRows(json.rows ?? [])
      setMessage(json.message ?? `Synced ${json.synced ?? 0} payment(s)`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="Payments"
        description="Pro upgrades via Razorpay — synced from database + live Razorpay"
      />
      <main className="admin-page">
        {message && <div className="admin-success-box">{message}</div>}
        {error && <div className="admin-error-box">{error}</div>}

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn-action admin-btn-action--pro"
            disabled={syncing || loading}
            onClick={() => void sync()}
          >
            {syncing ? 'Syncing from Razorpay…' : 'Sync from Razorpay'}
          </button>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-body" style={{ paddingTop: '1.25rem' }}>
            {loading ? (
              <p className="admin-loading">Loading payments…</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty">
                        No payments yet — click Sync from Razorpay to pull live data
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="admin-user-cell">
                            <strong>{r.email ?? 'Unknown'}</strong>
                            <span className="admin-mono admin-muted">{r.razorpayPaymentId.slice(0, 20)}…</span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge success">₹{r.amountInr}</span>
                        </td>
                        <td>
                          <span className="admin-plan-badge admin-plan-badge--pro">{r.plan}</span>
                        </td>
                        <td>
                          <span className={`admin-badge${r.status === 'paid' ? ' success' : ''}`}>{r.status}</span>
                        </td>
                        <td>
                          <span className="admin-muted">{r.source === 'razorpay' ? 'Razorpay live' : 'Database'}</span>
                        </td>
                        <td>
                          <span className="admin-muted">{formatDate(r.createdAt)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
