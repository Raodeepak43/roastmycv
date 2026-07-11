'use client'

import { cn } from '@/lib/utils'
import type { PrefillStatus } from '@/components/resume-builder/useRoastPrefill'

export function RoastPrefillBanner({
  status,
  filledCount,
  variant = 'dark',
}: {
  status: PrefillStatus
  filledCount: number
  variant?: 'dark' | 'light'
}) {
  if (status === 'idle') return null

  const isLight = variant === 'light'

  if (status === 'loading') {
    return (
      <div
        className={cn(
          'mb-4 rounded-xl border px-4 py-3 text-sm',
          isLight ? 'border-orange-200 bg-orange-50 text-orange-900' : 'border-orange/30 bg-orange/10 text-orange',
        )}
      >
        Pre-filling your resume from the roast…
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div
        className={cn(
          'mb-4 rounded-xl border px-4 py-3 text-sm',
          isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        )}
      >
        Pre-filled {filledCount} section{filledCount === 1 ? '' : 's'} from your roasted resume. Fill in anything
        that&apos;s missing or empty.
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div
        className={cn(
          'mb-4 rounded-xl border px-4 py-3 text-sm',
          isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        )}
      >
        Couldn&apos;t find the original resume for this roast. Fill in the form manually, or roast again and open the
        builder from the result page.
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'mb-4 rounded-xl border px-4 py-3 text-sm',
          isLight ? 'border-red-200 bg-red-50 text-red-800' : 'border-red-500/30 bg-red-500/10 text-red-300',
        )}
      >
        Auto-fill failed. You can still edit the form manually — only empty fields need your input.
      </div>
    )
  }

  return null
}
