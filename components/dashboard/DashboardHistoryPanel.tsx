'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Flame, Clock, ChevronRight, Download, FileText } from 'lucide-react'
import { ROAST_LANGUAGES } from '@/lib/roast/client'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { mergeHistory, importSessionRoastsToClient, type ClientHistoryItem } from '@/lib/dashboard/client-store'

type SortOrder = 'newest' | 'oldest'
type ScoreRange = 'all' | 'low' | 'mid' | 'high'

function languageLabel(code: string): string {
  const match = ROAST_LANGUAGES.find((l) => l.code === code)
  return match ? `${match.flag} ${match.name}` : code
}

function scoreInRange(score: number, range: ScoreRange): boolean {
  if (range === 'all') return true
  if (range === 'low') return score <= 3
  if (range === 'mid') return score >= 4 && score <= 6
  return score >= 7
}

function filterRoasts(
  roasts: ClientHistoryItem[],
  languageFilter: string,
  scoreRange: ScoreRange,
  sortOrder: SortOrder,
): ClientHistoryItem[] {
  let next = roasts

  if (languageFilter !== 'all') {
    next = next.filter((r) => r.language === languageFilter)
  }

  next = next.filter((r) => scoreInRange(r.score, scoreRange))

  return [...next].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
  })
}

async function exportRoastTxt(id: string, createdAt: string) {
  const res = await fetch(`/api/dashboard/roasts/${id}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Export failed')

  const roast = data.roast as {
    score: number
    title: string | null
    verdict: string | null
    file_name: string | null
    intensity: string
    language: string
    roast_data?: { lines?: string[]; fixes?: string[] }
  }

  const lines = [
    'MyCVRoast — Roast Export',
    `Date: ${new Date(createdAt).toLocaleString()}`,
    `Score: ${roast.score}/10`,
    roast.title ? `Title: ${roast.title}` : null,
    roast.file_name ? `File: ${roast.file_name}` : null,
    roast.language ? `Language: ${roast.language}` : null,
    roast.intensity ? `Intensity: ${roast.intensity}` : null,
    '',
    roast.verdict ? `Verdict: ${roast.verdict}` : null,
    '',
    'Feedback:',
    ...(roast.roast_data?.lines ?? []).map((line, i) => `${i + 1}. ${line}`),
    '',
    ...(roast.roast_data?.fixes?.length
      ? ['Suggested fixes:', ...roast.roast_data.fixes.map((f) => `- ${f}`)]
      : []),
  ]
    .filter((line) => line !== null)
    .join('\n')

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roast-${new Date(createdAt).toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const selectClassName =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500]/30'

export function DashboardHistoryPanel({ embedded = false }: { embedded?: boolean }) {
  const { userId } = useDashboardUser()
  const [roasts, setRoasts] = useState<ClientHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [languageFilter, setLanguageFilter] = useState('all')
  const [scoreRange, setScoreRange] = useState<ScoreRange>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (userId) importSessionRoastsToClient(userId)
        const res = await fetch('/api/dashboard/roasts')
        if (!res.ok || cancelled) return
        const data = await res.json()
        setRoasts(mergeHistory(data.roasts ?? [], userId, data.dbReady ?? false))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const filteredRoasts = useMemo(
    () => filterRoasts(roasts, languageFilter, scoreRange, sortOrder),
    [roasts, languageFilter, scoreRange, sortOrder],
  )

  const filtersActive = languageFilter !== 'all' || scoreRange !== 'all'

  const handleExport = async (id: string, createdAt: string) => {
    setExportingId(id)
    try {
      await exportRoastTxt(id, createdAt)
    } catch {
      /* ignore */
    } finally {
      setExportingId(null)
    }
  }

  return (
    <>
      {!embedded && (
        <DashboardPageHeader
          title="Roast history"
          description="Every roast you run while signed in is saved here."
          action={
            <Link href="/dashboard/roast" className="dash-btn-primary text-sm">
              <Flame className="size-4" aria-hidden />
              New roast
            </Link>
          }
        />
      )}

      <div className="dash-card">
        {loading ? (
          <div className="dash-card-body py-16 text-center text-sm text-gray-500">Loading history…</div>
        ) : roasts.length === 0 ? (
          <div className="dash-card-body py-16 text-center">
            <FileText className="mx-auto mb-3 size-10 text-[#ff4500]/60" aria-hidden />
            <p className="text-base font-semibold text-gray-900">No roasts yet</p>
            <p className="mt-1 text-sm text-gray-500">Upload your CV on the Roast page to get started</p>
            <Link href="/dashboard/roast" className="dash-btn-primary mt-6 inline-flex text-sm">
              Roast my CV →
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-100 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="min-w-[140px] flex-1">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Language
                  </span>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className={selectClassName}
                    aria-label="Filter by language"
                  >
                    <option value="all">All languages</option>
                    {ROAST_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="min-w-[140px] flex-1">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Score range
                  </span>
                  <select
                    value={scoreRange}
                    onChange={(e) => setScoreRange(e.target.value as ScoreRange)}
                    className={selectClassName}
                    aria-label="Filter by score range"
                  >
                    <option value="all">All scores</option>
                    <option value="low">Low (0–3)</option>
                    <option value="mid">Mid (4–6)</option>
                    <option value="high">High (7–10)</option>
                  </select>
                </label>

                <label className="min-w-[140px] flex-1 sm:max-w-[180px]">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sort by
                  </span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className={selectClassName}
                    aria-label="Sort roasts"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </label>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {filteredRoasts.length} of {roasts.length} roast{roasts.length === 1 ? '' : 's'}
                {filtersActive ? ' matching filters' : ''}
              </p>
            </div>

            {filteredRoasts.length === 0 ? (
              <div className="dash-card-body py-12 text-center text-sm text-gray-500">
                No roasts match these filters.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLanguageFilter('all')
                    setScoreRange('all')
                  }}
                  className="font-medium text-[#ff4500] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredRoasts.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 px-5 py-4 md:px-6">
                    <Link
                      href={`/dashboard/roast/${r.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4 transition-colors hover:opacity-90"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4ed] text-lg font-bold text-[#ff4500]">
                        {r.score}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{r.title || 'Untitled roast'}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                          {r.file_name && <span className="truncate">{r.file_name}</span>}
                          {r.language && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                              {languageLabel(r.language)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3 shrink-0" aria-hidden />
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                        {r.verdict && (
                          <p className="mt-1 truncate text-xs text-gray-400">&ldquo;{r.verdict}&rdquo;</p>
                        )}
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-gray-300" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleExport(r.id, r.created_at)}
                      disabled={exportingId === r.id}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff4500]/30 hover:text-[#ff4500] disabled:opacity-50"
                      title="Export as .txt"
                    >
                      <Download className="size-3.5" aria-hidden />
                      {exportingId === r.id ? '…' : 'Export'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  )
}
