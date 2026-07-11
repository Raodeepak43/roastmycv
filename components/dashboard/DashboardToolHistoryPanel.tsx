'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Sparkles } from 'lucide-react'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'
import { MarkdownBlock } from '@/components/dashboard/tools/ToolShell'

type ToolHistoryItem = {
  id: string
  tool_slug: string
  title: string | null
  input_summary: string | null
  created_at: string
}

function toolHref(slug: string) {
  return DASHBOARD_TOOLS.find((t) => t.slug === slug)?.href ?? `/dashboard/tools/${slug}`
}

function toolLabel(slug: string) {
  return DASHBOARD_TOOLS.find((t) => t.slug === slug)?.label ?? slug
}

export function DashboardToolHistoryPanel() {
  const [items, setItems] = useState<ToolHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [openText, setOpenText] = useState('')
  const [openTitle, setOpenTitle] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/tool-results?all=1&limit=50')
        if (!res.ok) return
        const data = await res.json()
        setItems(data.items ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const openItem = async (item: ToolHistoryItem) => {
    if (openId === item.id) {
      setOpenId(null)
      return
    }
    const res = await fetch(`/api/dashboard/tool-results/${item.id}`)
    if (!res.ok) return
    const data = await res.json()
    setOpenId(item.id)
    setOpenText(data.item?.result_text ?? '')
    setOpenTitle(data.item?.title ?? toolLabel(item.tool_slug))
  }

  if (loading) {
    return <div className="dash-card-body py-16 text-center text-sm text-gray-500">Loading AI tool history…</div>
  }

  if (items.length === 0) {
    return (
      <div className="dash-card-body py-16 text-center">
        <Sparkles className="mx-auto mb-3 size-10 text-[#ff4500]/60" aria-hidden />
        <p className="text-base font-semibold text-gray-900">No AI tool runs yet</p>
        <p className="mt-1 text-sm text-gray-500">Skills Gap, LinkedIn Writer, Job Match, and other tools save here automatically.</p>
        <Link href="/dashboard/tools/skills-gap" className="dash-btn-primary mt-6 inline-flex text-sm">
          Try Skills Gap →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="dash-card divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 md:px-6"
              onClick={() => void openItem(item)}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4ed] text-lg">
                {DASHBOARD_TOOLS.find((t) => t.slug === item.tool_slug)?.icon ?? '✨'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{item.title ?? toolLabel(item.tool_slug)}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                  {item.input_summary && <span className="truncate">{item.input_summary}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" aria-hidden />
                    {new Date(item.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>
              <Link
                href={toolHref(item.tool_slug)}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-xs font-medium text-[#ff4500] hover:underline"
              >
                Open tool
              </Link>
            </button>
            {openId === item.id && openText && (
              <div className="border-t border-gray-100 bg-[#fafafa] px-5 py-5 md:px-6">
                <MarkdownBlock content={openText} title={openTitle} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
