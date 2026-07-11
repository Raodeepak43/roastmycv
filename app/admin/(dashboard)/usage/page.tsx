'use client'

import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { FREE_LIMIT } from '@/lib/usage'

type Row = { fingerprint: string; used_count: number; paid?: boolean; updated_at: string }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminUsagePage() {
  return (
    <AdminDataTable<Row>
      title="Guest Usage"
      description="Anonymous browser fingerprints — free roast limits"
      fetchUrl="/api/admin/data?view=usage"
      emptyMessage="No usage records yet"
      columns={[
        {
          key: 'fingerprint',
          header: 'Fingerprint',
          cell: (r) => <code className="admin-mono">{r.fingerprint}</code>,
        },
        {
          key: 'used_count',
          header: 'Roasts used',
          cell: (r) => (
            <span className={`admin-badge${r.used_count >= FREE_LIMIT ? ' warn' : ''}`}>
              {r.used_count} / 5
            </span>
          ),
        },
        {
          key: 'paid',
          header: 'Pro',
          cell: (r) =>
            r.paid ? (
              <span className="admin-plan-badge admin-plan-badge--pro">Paid</span>
            ) : (
              <span className="admin-muted">—</span>
            ),
        },
        { key: 'updated_at', header: 'Last active', cell: (r) => <span className="admin-muted">{formatDate(r.updated_at)}</span> },
      ]}
    />
  )
}
