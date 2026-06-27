'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
}

export function AdminDataTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  rows,
  loading,
  emptyMessage,
  fetchUrl,
}: {
  title: string
  description?: string
  columns: Column<T>[]
  rows?: T[]
  loading?: boolean
  emptyMessage?: string
  fetchUrl?: string
}) {
  const [data, setData] = useState<T[]>(rows ?? [])
  const [isLoading, setIsLoading] = useState(!!fetchUrl)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!fetchUrl) return
    fetch(fetchUrl, { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed')
        setData(json.rows ?? [])
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setIsLoading(false))
  }, [fetchUrl])

  const showLoading = loading ?? isLoading
  const tableRows = fetchUrl ? data : (rows ?? [])

  return (
    <>
      <AdminHeader title={title} description={description} />
      <main className="admin-page">
        {error && <div className="admin-error-box">{error}</div>}
        <div className="admin-panel">
          <div className="admin-panel-body" style={{ paddingTop: '1.25rem' }}>
            {showLoading ? (
              <p className="admin-loading">Loading…</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="empty">
                        {emptyMessage ?? 'No data'}
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td key={col.key}>{col.cell(row)}</td>
                        ))}
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
