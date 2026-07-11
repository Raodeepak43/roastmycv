'use client'

import Link from 'next/link'
import { ArrowLeft, Flame } from 'lucide-react'
import type { RoastResultData } from '@/components/RoastResultView'
import { RoastFixChecklist } from '@/components/RoastFixChecklist'
import { RoastShareBar } from '@/components/roast/RoastShareBar'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'

function scoreColor(score: number) {
  if (score < 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  if (score <= 8) return 'text-orange'
  return 'text-emerald-500'
}

export function DashboardRoastResult({
  roastId,
  shareToken,
  roast,
  fileName,
  createdAt,
}: {
  roastId: string
  shareToken?: string
  roast: RoastResultData
  fileName?: string | null
  createdAt?: string
}) {
  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <>
      <DashboardPageHeader
        title={roast.title || 'Your roast'}
        description={fileName ? `From ${fileName}` : 'Saved to your account history'}
        action={
          <Link href="/dashboard/roast" className="dash-btn-secondary text-sm">
            <Flame className="size-4" aria-hidden />
            New roast
          </Link>
        }
      />

      <div className="mb-4">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to history
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-5 lg:gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="dash-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Score</p>
            <p className={`mt-2 text-6xl font-bold tabular-nums ${scoreColor(roast.score)}`}>
              {roast.score}
              <span className="text-2xl text-gray-400">/10</span>
            </p>
            {roast.verdict && (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">&ldquo;{roast.verdict}&rdquo;</p>
            )}
            {dateLabel && <p className="mt-4 text-xs text-gray-400">Roasted on {dateLabel}</p>}
          </div>

          {roast.fixes && roast.fixes.length > 0 && (
            <div className="dash-card mt-5">
              <div className="dash-card-body">
                <RoastFixChecklist
                  roastId={roastId}
                  fixes={roast.fixes}
                  variant="light"
                  title="Mark fixes as you go"
                  resumeBuilderHref={`/dashboard/resume-builder?fromRoast=${encodeURIComponent(roastId)}`}
                  roastAgainHref="/dashboard/roast"
                  resumeBuilderLabel="Fix in Resume Builder"
                  roastAgainLabel="Roast updated resume"
                  allDoneLabel="Nice — all fixes checked off. Upload your updated resume and roast again."
                />
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="dash-card">
            <div className="dash-card-header flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Roast breakdown</p>
              <span className="dash-badge">{roast.lines.length} points</span>
            </div>
            <div className="dash-card-body space-y-4">
              {roast.lines.map((line, i) => (
                <div key={i} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <span className="font-body text-xs font-semibold text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-800">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {shareToken && (
        <div className="mt-6">
          <RoastShareBar
            shareToken={shareToken}
            score={roast.score}
            language={roast.language}
            intensity={roast.intensity}
            lines={roast.lines}
            title={roast.title}
            verdict={roast.verdict}
            fixes={roast.fixes}
          />
        </div>
      )}
    </>
  )
}
