'use client'

import { useEffect, useState } from 'react'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { TOOL_ACCESS } from '@/lib/tools/dashboard/config'

export function useToolPlan(toolSlug: ToolSlug) {
  const [isPro, setIsPro] = useState(false)
  const [used, setUsed] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/me')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setIsPro(data.usage?.plan === 'pro')
        }
        const usageRes = await fetch(`/api/dashboard/tool-usage?slug=${toolSlug}`)
        if (usageRes.ok) {
          const u = await usageRes.json()
          if (!cancelled) setUsed(u.used ?? 0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toolSlug])

  const access = TOOL_ACCESS[toolSlug]
  const limit = isPro ? 999 : access.freeLimit

  return { isPro, used, limit, loading, access }
}

export function useToolHistory() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)

  return {
    refreshKey,
    activeId,
    bumpHistory: () => setRefreshKey((k) => k + 1),
    loadHistory: (text: string, id: string, apply: (value: string) => void) => {
      setActiveId(id)
      apply(text)
    },
  }
}

type ToolApiOk = { ok: true; data: unknown }
type ToolApiErr = { ok: false; error: string; status: number }

export async function callToolApi(
  path: string,
  body: Record<string, unknown>,
): Promise<ToolApiOk | ToolApiErr> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (res.headers.get('content-type')?.includes('text/plain')) {
    if (!res.ok) {
      const err = await res.text()
      return { ok: false as const, error: err || 'Request failed', status: res.status }
    }
    const reader = res.body?.getReader()
    if (!reader) return { ok: false as const, error: 'No stream', status: 500 }
    const decoder = new TextDecoder()
    let text = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
    }
    return { ok: true as const, data: text }
  }

  const data = await res.json()
  if (!res.ok) {
    return { ok: false as const, error: data.error ?? 'Request failed', status: res.status }
  }
  return { ok: true as const, data }
}

export async function streamToolApi(
  path: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const contentType = res.headers.get('content-type') ?? ''

    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const data = await res.json()
        return { ok: false as const, error: data.error ?? 'Request failed', status: res.status }
      }
      const text = await res.text().catch(() => '')
      return {
        ok: false as const,
        error: text.trim() || `Request failed (${res.status})`,
        status: res.status,
      }
    }

    const reader = res.body?.getReader()
    if (!reader) return { ok: false as const, error: 'No response stream', status: 500 }

    const decoder = new TextDecoder()
    let full = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      full += chunk
      onChunk(chunk)
    }

    if (full.includes('⚠️')) {
      const errLine = full.split('\n').find((l) => l.includes('⚠️')) ?? full
      return { ok: false as const, error: errLine.replace(/^⚠️\s*/, '').trim() || 'AI request failed', status: 502 }
    }

    return { ok: true as const }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Network error — try again',
      status: 0,
    }
  }
}
