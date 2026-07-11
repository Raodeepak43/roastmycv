'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'

export type ResumeBuilderUsageBadgeProps = {
  aiLeft: number
  pdfLeft: number
  isPro?: boolean
  /** Dashboard light badge vs dark nav text */
  variant?: 'light' | 'dark'
  upgradeHref?: string
}

function formatCount(n: number): string {
  return n === Infinity || n >= 999 ? '∞' : String(n)
}

function UsageSegment({
  count,
  label,
  upgradeHref,
  variant,
}: {
  count: number
  label: string
  upgradeHref: string
  variant: 'light' | 'dark'
}) {
  const depleted = count === 0
  const display = count === Infinity || count >= 999 ? `Unlimited ${label}` : `${formatCount(count)} ${label}`

  if (depleted) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="font-medium text-[#ff4500]">0 {label}</span>
        <Link
          href={upgradeHref}
          className="text-[10px] font-semibold text-[#ff4500] underline underline-offset-2 hover:text-[#cc3700]"
        >
          Upgrade
        </Link>
      </span>
    )
  }

  return (
    <span className={variant === 'light' ? 'text-gray-700' : 'text-muted'}>{display}</span>
  )
}

export function ResumeBuilderUsageBadge({
  aiLeft,
  pdfLeft,
  isPro = false,
  variant = 'light',
  upgradeHref = '/dashboard/plans',
}: ResumeBuilderUsageBadgeProps) {
  const aiCreditHint =
    isPro || aiLeft >= 999
      ? 'Unlimited AI improvements'
      : 'Each AI improvement uses 1 credit. Free plan: 5 total.'
  const pdfTooltip =
    isPro || pdfLeft >= 999
      ? 'Unlimited PDF exports'
      : `${pdfLeft} PDF export${pdfLeft === 1 ? '' : 's'} left`

  const tooltip = `${aiCreditHint} · ${pdfTooltip}`

  const wrapperClass =
    variant === 'light'
      ? 'dash-badge group relative inline-flex cursor-default flex-wrap items-center gap-x-1.5 text-xs'
      : 'group relative hidden cursor-default flex-wrap items-center gap-x-1.5 font-body text-[10px] md:inline-flex'

  return (
    <span className={wrapperClass} title={tooltip}>
      <UsageSegment count={aiLeft} label="AI fixes" upgradeHref={upgradeHref} variant={variant} />
      <span
        className={`inline-flex items-center gap-0.5 ${variant === 'light' ? 'text-gray-500' : 'text-dim'}`}
        title={aiCreditHint}
      >
        <Info className="size-3 shrink-0" aria-hidden />
      </span>
      <span className={variant === 'light' ? 'text-gray-400' : 'text-dim'} aria-hidden>
        ·
      </span>
      <UsageSegment count={pdfLeft} label="PDF exports" upgradeHref={upgradeHref} variant={variant} />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-20 hidden w-max max-w-[260px] -translate-x-1/2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-center text-[11px] leading-snug text-gray-600 shadow-md group-hover:block group-focus-within:block"
      >
        {tooltip}
      </span>
    </span>
  )
}
