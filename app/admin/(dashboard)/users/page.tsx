'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Crown, UserMinus } from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { AdminUserRow } from '@/lib/admin/users'

type PlanFilter = 'all' | 'pro' | 'free' | 'paid_not_pro'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function PlanBadge({ plan }: { plan: 'free' | 'pro' }) {
  return (
    <span className={`admin-plan-badge admin-plan-badge--${plan}`}>
      {plan === 'pro' ? 'Pro' : 'Free'}
    </span>
  )
}

type DbStatus = { pgReady: boolean; apiReady: boolean; ready: boolean } | null

async function loadDbStatus(): Promise<DbStatus> {
  const res = await fetch('/api/admin/migrate-db', { credentials: 'include' })
  const json = await res.json()
  if (!res.ok) return null
  return {
    pgReady: Boolean(json.pgReady),
    apiReady: Boolean(json.apiReady),
    ready: Boolean(json.ready ?? json.userUsageReady),
  }
}

async function loadUsers(): Promise<AdminUserRow[]> {
  const res = await fetch('/api/admin/data?view=users', { credentials: 'include' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed')
  return json.rows ?? []
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [grantEmail, setGrantEmail] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [grantBusy, setGrantBusy] = useState(false)
  const [dbStatus, setDbStatus] = useState<DbStatus>(null)
  const [migrateBusy, setMigrateBusy] = useState(false)
  const [syncBusy, setSyncBusy] = useState(false)

  const refreshDbStatus = useCallback(async () => {
    setDbStatus(await loadDbStatus())
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await loadUsers())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    void refreshDbStatus()
  }, [refresh, refreshDbStatus])

  const runDbAction = async (action: 'migrate' | 'sync_api') => {
    const busy = action === 'sync_api' ? setSyncBusy : setMigrateBusy
    busy(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/migrate-db', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) {
        const hint =
          typeof json.error === 'string' && json.error.includes('certificate')
            ? ' SSL failed — open Supabase SQL Editor, paste scripts/migrate-user-tables.sql, and Run.'
            : ''
        throw new Error((json.error ?? 'Migration failed') + hint)
      }
      setSuccess(json.message ?? 'Done')
      setDbStatus({
        pgReady: Boolean(json.pgReady),
        apiReady: Boolean(json.apiReady),
        ready: Boolean(json.ready ?? json.userUsageReady),
      })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      busy(false)
    }
  }

  const paidNotProCount = rows.filter((r) => r.plan === 'free' && r.totalPaidInr > 0).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (planFilter === 'pro' && r.plan !== 'pro') return false
      if (planFilter === 'free' && r.plan !== 'free') return false
      if (planFilter === 'paid_not_pro' && !(r.plan === 'free' && r.totalPaidInr > 0)) return false
      if (!q) return true
      return (
        r.email.toLowerCase().includes(q) ||
        (r.name?.toLowerCase().includes(q) ?? false) ||
        r.id.toLowerCase().includes(q)
      )
    })
  }, [rows, search, planFilter])

  const proCount = rows.filter((r) => r.plan === 'pro').length
  const freeCount = rows.length - proCount

  const setPlan = async (userId: string, plan: 'free' | 'pro') => {
    setBusyId(userId)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_plan', userId, plan }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      setSuccess(json.message ?? 'Plan updated')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const grantByEmail = async (email: string) => {
    const trimmed = email.trim()
    if (!trimmed) return
    setGrantBusy(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_pro', email: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Grant failed')
      setSuccess(json.message ?? 'Pro granted')
      setGrantEmail('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grant failed')
    } finally {
      setGrantBusy(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="Users"
        description="Grant Pro manually, fix paid users, manage plans"
      />
      <main className="admin-page">
        {error && <div className="admin-error-box">{error}</div>}
        {success && <div className="admin-success-box">{success}</div>}

        {dbStatus && !dbStatus.ready && (
          <div className="admin-panel admin-db-warn">
            <div className="admin-panel-body">
              {dbStatus.pgReady && !dbStatus.apiReady ? (
                <>
                  <p>
                    <strong>Tables created in Postgres.</strong> Supabase API is still syncing
                    (PostgREST schema cache). Grant Pro via auth still works — click Sync to finish.
                  </p>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-btn-action admin-btn-action--pro"
                      disabled={syncBusy}
                      onClick={() => void runDbAction('sync_api')}
                    >
                      {syncBusy ? 'Syncing…' : 'Sync API schema'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Database tables missing.</strong> Pro upgrades need the{' '}
                    <code>user_usage</code> table. Run setup once, then grant Pro.
                  </p>
                  <button
                    type="button"
                    className="admin-btn-action admin-btn-action--pro"
                    disabled={migrateBusy}
                    onClick={() => void runDbAction('migrate')}
                  >
                    {migrateBusy ? 'Setting up…' : 'Setup database tables'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="admin-panel admin-grant-panel">
          <div className="admin-panel-head">
            <h2>Grant Pro by email</h2>
            <p>For users who paid but didn&apos;t get upgraded automatically</p>
          </div>
          <div className="admin-panel-body admin-grant-row">
            <input
              type="email"
              className="admin-search"
              placeholder="user@email.com"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void grantByEmail(grantEmail)
              }}
            />
            <button
              type="button"
              className="admin-btn-action admin-btn-action--pro"
              disabled={grantBusy || !grantEmail.trim()}
              onClick={() => void grantByEmail(grantEmail)}
            >
              <Crown size={14} />
              {grantBusy ? 'Granting…' : 'Grant Pro'}
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-search"
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="admin-filter-tabs">
            {(
              [
                ['all', `All (${rows.length})`],
                ['pro', `Pro (${proCount})`],
                ['free', `Free (${freeCount})`],
                ['paid_not_pro', `Paid, not Pro (${paidNotProCount})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`admin-filter-tab${planFilter === id ? ' active' : ''}`}
                onClick={() => setPlanFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-body" style={{ paddingTop: '1.25rem' }}>
            {loading ? (
              <p className="admin-loading">Loading users…</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Roasts</th>
                    <th>Paid</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty">
                        {rows.length === 0 ? 'No registered users yet' : 'No users match your filters'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const needsFix = r.plan === 'free' && r.totalPaidInr > 0
                      return (
                        <tr key={r.id} className={needsFix ? 'admin-row-warn' : undefined}>
                          <td>
                            <div className="admin-user-cell">
                              <strong>{r.name ?? r.email.split('@')[0]}</strong>
                              <span className="admin-muted">{r.email}</span>
                              {needsFix && (
                                <span className="admin-tag admin-tag--warn">Paid — not Pro</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <PlanBadge plan={r.plan} />
                          </td>
                          <td>{r.roastsUsed}</td>
                          <td>
                            {r.totalPaidInr > 0 ? (
                              <span className="admin-badge success">₹{r.totalPaidInr}</span>
                            ) : (
                              <span className="admin-muted">—</span>
                            )}
                          </td>
                          <td className="admin-muted">{formatDate(r.createdAt)}</td>
                          <td>
                            <div className="admin-row-actions">
                              {r.plan === 'free' ? (
                                <button
                                  type="button"
                                  className="admin-btn-action admin-btn-action--pro"
                                  disabled={busyId === r.id}
                                  onClick={() => void setPlan(r.id, 'pro')}
                                >
                                  <Crown size={13} />
                                  {busyId === r.id ? '…' : 'Grant Pro'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-btn-action admin-btn-action--muted"
                                  disabled={busyId === r.id}
                                  onClick={() => void setPlan(r.id, 'free')}
                                >
                                  <UserMinus size={13} />
                                  {busyId === r.id ? '…' : 'Set Free'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
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
