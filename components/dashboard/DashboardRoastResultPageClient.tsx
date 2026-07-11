'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadRoast, saveRoast } from '@/lib/roast-session'
import { savePublicRoastViaApi } from '@/lib/roast/public-save'
import { DashboardRoastResult } from '@/components/dashboard/DashboardRoastResult'
import type { IntensityKey } from '@/app/i18n'

type LoadedRoast = {
  lines: string[]
  score: number
  intensity: IntensityKey
  language: string
  title?: string
  verdict?: string
  fixes?: string[]
  fileName?: string | null
  createdAt?: string
}

export function DashboardRoastResultPageClient() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const [roast, setRoast] = useState<LoadedRoast | null>(null)
  const [shareToken, setShareToken] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) {
      setMissing(true)
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      const cached = loadRoast(id)
      if (cached && !cancelled) {
        setRoast({
          lines: cached.lines,
          score: cached.score,
          intensity: cached.intensity,
          language: cached.language,
          title: cached.title,
          verdict: cached.verdict,
          fixes: cached.fixes,
        })
        if (cached.shareToken) setShareToken(cached.shareToken)
        setLoading(false)
      }

      try {
        const res = await fetch(`/api/dashboard/roasts/${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = await res.json()
          const row = data.roast
          if (row && !cancelled) {
            const payload = row.roast_data as { lines?: string[]; fixes?: string[] }
            const loaded: LoadedRoast = {
              lines: payload.lines ?? [],
              score: row.score,
              intensity: row.intensity as IntensityKey,
              language: row.language,
              title: row.title ?? undefined,
              verdict: row.verdict ?? undefined,
              fixes: payload.fixes,
              fileName: row.file_name,
              createdAt: row.created_at,
            }
            setRoast(loaded)
            setMissing(false)

            const token =
              cached?.shareToken ??
              (await savePublicRoastViaApi({
                score: loaded.score,
                intensity: loaded.intensity,
                language: loaded.language,
                lines: loaded.lines,
                title: loaded.title,
                verdict: loaded.verdict,
                fixes: loaded.fixes,
              }))

            if (token && !cancelled) {
              setShareToken(token)
              if (cached) {
                saveRoast(id, { ...cached, shareToken: token })
              }
            }
          }
        } else if (!cached && !cancelled) {
          setMissing(true)
        }
      } catch {
        if (!cached && !cancelled) setMissing(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff4500] border-t-transparent" />
      </div>
    )
  }

  if (missing || !roast) {
    return (
      <div className="dash-card mx-auto max-w-md p-10 text-center">
        <p className="mb-3 text-4xl">🔥</p>
        <h2 className="text-lg font-semibold text-gray-900">Roast not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          This roast may have expired or could not be saved. Try roasting again.
        </p>
        <Link href="/dashboard/roast" className="dash-btn-primary mt-6 inline-flex text-sm">
          Roast my CV
        </Link>
      </div>
    )
  }

  return (
    <DashboardRoastResult
      roastId={id}
      shareToken={shareToken}
      roast={{
        lines: roast.lines,
        score: roast.score,
        intensity: roast.intensity,
        language: roast.language,
        title: roast.title,
        verdict: roast.verdict,
        fixes: roast.fixes,
      }}
      fileName={roast.fileName}
      createdAt={roast.createdAt}
    />
  )
}
