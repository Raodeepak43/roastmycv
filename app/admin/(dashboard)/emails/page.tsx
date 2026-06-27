'use client'

import { AdminDataTable } from '@/components/admin/AdminDataTable'

type Row = { email: string; created_at: string }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminEmailsPage() {
  return (
    <AdminDataTable<Row>
      title="Email List"
      description="Newsletter and join-modal captures"
      fetchUrl="/api/admin/data?view=emails"
      emptyMessage="No email signups yet"
      columns={[
        { key: 'email', header: 'Email', cell: (r) => r.email },
        { key: 'created_at', header: 'Signed up', cell: (r) => <span className="admin-muted">{formatDate(r.created_at)}</span> },
      ]}
    />
  )
}
