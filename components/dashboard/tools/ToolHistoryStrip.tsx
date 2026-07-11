'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { ToolSlug } from '@/lib/tools/dashboard/config'

type HistoryItem = {
  id: string
  tool_slug: string
  title: string | null
  input_summary: string | null
  created_at: string
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ToolHistoryStrip({
  toolSlug,
  onLoad,
  refreshKey = 0,
  activeId,
}: {
  toolSlug: ToolSlug
  onLoad: (resultText: string, id: string) => void
  refreshKey?: number
  activeId?: string | null
}) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/tool-results?slug=${toolSlug}&limit=8`)
      if (!res.ok) return
      const data = await res.json()
      setItems(data.items ?? [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [toolSlug])

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory, refreshKey])

  const openItem = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/tool-results/${id}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.item?.result_text) {
        onLoad(data.item.result_text as string, id)
      }
    } catch {
      /* ignore */
    }
  }

  if (loading && items.length === 0) return null
  if (items.length === 0) return null

  return (
    <div className="tool-history dash-card p-4">
      <div className="tool-history__head">
        <p className="tool-history__title">Previous runs</p>
        <Link href="/dashboard/history?tab=tools" className="text-xs font-medium text-[#ff4500] hover:underline">
          View all
        </Link>
      </div>
      <div className="tool-history__list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tool-history__item ${activeId === item.id ? 'tool-history__item--active' : ''}`}
            onClick={() => void openItem(item.id)}
          >
            <Clock className="size-3 opacity-60" aria-hidden />
            <span>{item.input_summary || formatWhen(item.created_at)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
