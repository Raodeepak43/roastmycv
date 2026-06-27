'use client'

import { AdminDataTable } from '@/components/admin/AdminDataTable'

type Row = { name: string; score: number | null; language: string | null; created_at: string }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminSignupsPage() {
  return (
    <AdminDataTable<Row>
      title="Ticker Signups"
      description="Users who added their name to the roast ticker"
      fetchUrl="/api/admin/data?view=signups"
      emptyMessage="No ticker signups yet"
      columns={[
        { key: 'name', header: 'Name', cell: (r) => <strong>{r.name}</strong> },
        {
          key: 'score',
          header: 'Score',
          cell: (r) =>
            r.score != null ? <span className="admin-badge">{r.score}/10</span> : '—',
        },
        { key: 'language', header: 'Language', cell: (r) => r.language ?? '—' },
        { key: 'created_at', header: 'Joined', cell: (r) => <span className="admin-muted">{formatDate(r.created_at)}</span> },
      ]}
    />
  )
}
