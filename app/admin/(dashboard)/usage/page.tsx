'use client'

import { AdminDataTable } from '@/components/admin/AdminDataTable'

type Row = { fingerprint: string; used_count: number; updated_at: string }

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
      title="Usage Limits"
      description="Free roast limits per browser fingerprint"
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
            <span className={`admin-badge${r.used_count >= 5 ? ' warn' : ''}`}>
              {r.used_count} / 5
            </span>
          ),
        },
        { key: 'updated_at', header: 'Last active', cell: (r) => <span className="admin-muted">{formatDate(r.updated_at)}</span> },
      ]}
    />
  )
}
