'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Flame,
  Mail,
  Users,
  Crown,
  IndianRupee,
  UserPlus,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { AdminOverview } from '@/lib/admin/data'
import { FREE_LIMIT } from '@/lib/usage'

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
  accent,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: 'pro' | 'revenue'
}) {
  return (
    <div className={`admin-stat-card${accent ? ` admin-stat-card--${accent}` : ''}`}>
      <div className="admin-stat-card-top">
        <span className="admin-stat-label">{title}</span>
        <Icon size={16} />
      </div>
      <div className="admin-stat-value">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
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

  const u = data.users

  return (
    <div className="admin-stack">
      <div className="admin-stats-grid">
        <StatCard title="Registered Users" value={u.totalUsers} icon={Users} hint={`+${u.signupsLast7Days} last 7 days`} />
        <StatCard title="Pro Users" value={u.proUsers} icon={Crown} hint="Paid dashboard accounts" accent="pro" />
        <StatCard title="Free Users" value={u.freeUsers} icon={Users} hint="Signed-in, not upgraded" />
        <StatCard
          title="Revenue"
          value={`₹${u.revenueInr.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          hint={`${u.totalPayments} payment${u.totalPayments === 1 ? '' : 's'}`}
          accent="revenue"
        />
      </div>

      <div className="admin-stats-grid">
        <StatCard title="Total Roasts" value={data.roastCount} icon={Flame} hint="All-time site counter" />
        <StatCard title="Saved Roasts" value={u.totalRoastsSaved} icon={Flame} hint="Logged-in user history" />
        <StatCard title="Guest Pro (FP)" value={u.paidFingerprints} icon={Crown} hint="Anonymous paid unlocks" />
        <StatCard title="Email Leads" value={data.emailSignups} icon={Mail} />
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head admin-panel-head--row">
            <div>
              <h2>Recent Users</h2>
              <p>New sign-ups and their plan</p>
            </div>
            <Link href="/admin/users" className="admin-link-btn">
              All users <ChevronRight size={14} />
            </Link>
          </div>
          <div className="admin-panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">No users yet</td>
                  </tr>
                ) : (
                  data.recentUsers.map((row, i) => (
                    <tr key={i}>
                      <td>{row.email}</td>
                      <td>
                        <span className={`admin-plan-badge admin-plan-badge--${row.plan === 'pro' ? 'pro' : 'free'}`}>
                          {row.plan === 'pro' ? 'Pro' : 'Free'}
                        </span>
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
          <div className="admin-panel-head admin-panel-head--row">
            <div>
              <h2>Recent Payments</h2>
              <p>Pro upgrades via Razorpay</p>
            </div>
            <Link href="/admin/payments" className="admin-link-btn">
              All payments <ChevronRight size={14} />
            </Link>
          </div>
          <div className="admin-panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">No payments yet</td>
                  </tr>
                ) : (
                  data.recentPayments.map((row, i) => (
                    <tr key={i}>
                      <td>{row.email ?? '—'}</td>
                      <td><span className="admin-badge success">₹{row.amount_inr}</span></td>
                      <td className="admin-muted">{formatDate(row.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Recent Emails</h2>
            <p>Newsletter / join list</p>
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
                  <tr><td colSpan={2} className="empty">No emails yet</td></tr>
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

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Top Guest Usage</h2>
            <p>Browser fingerprints — free limit {FREE_LIMIT}</p>
          </div>
          <div className="admin-panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fingerprint</th>
                  <th>Used</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsage.length === 0 ? (
                  <tr><td colSpan={3} className="empty">No usage data</td></tr>
                ) : (
                  data.topUsage.map((row) => (
                    <tr key={row.fingerprint}>
                      <td className="admin-mono">{row.fingerprint.slice(0, 16)}…</td>
                      <td>
                        <span className={`admin-badge${row.used_count >= FREE_LIMIT ? ' warn' : ''}`}>
                          {row.used_count}
                        </span>
                      </td>
                      <td>{row.paid ? <span className="admin-plan-badge admin-plan-badge--pro">Paid</span> : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-quick-links">
        <Link href="/admin/users" className="admin-quick-link">
          <Users size={18} />
          <span>Manage all users</span>
          <UserPlus size={14} className="admin-quick-link-arrow" />
        </Link>
        <Link href="/admin/payments" className="admin-quick-link">
          <IndianRupee size={18} />
          <span>Payment history</span>
          <ChevronRight size={14} className="admin-quick-link-arrow" />
        </Link>
      </div>
    </div>
  )
}
