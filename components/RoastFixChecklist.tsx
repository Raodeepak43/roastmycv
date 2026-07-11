'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadFixDone, saveFixDone } from '@/lib/roast/fix-checklist'

type Variant = 'dark' | 'light'

export interface RoastFixChecklistProps {
  roastId: string
  fixes: string[]
  variant?: Variant
  title?: string
  resumeBuilderHref?: string
  roastAgainHref?: string
  resumeBuilderLabel?: string
  roastAgainLabel?: string
  allDoneLabel?: string
}

export function RoastFixChecklist({
  roastId,
  fixes,
  variant = 'dark',
  title = 'Your action plan',
  resumeBuilderHref = '/resume-builder',
  roastAgainHref = '/',
  resumeBuilderLabel = 'Fix in Resume Builder',
  roastAgainLabel = 'Roast updated resume',
  allDoneLabel = 'All fixes done — time to re-roast and see your new score.',
}: RoastFixChecklistProps) {
  const [done, setDone] = useState<boolean[]>(() => Array.from({ length: fixes.length }, () => false))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDone(loadFixDone(roastId, fixes.length))
    setReady(true)
  }, [roastId, fixes.length])

  const toggle = (index: number) => {
    setDone((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      saveFixDone(roastId, next)
      return next
    })
  }

  const completed = done.filter(Boolean).length
  const allDone = fixes.length > 0 && completed === fixes.length
  const isLight = variant === 'light'

  if (!fixes.length) return null

  return (
    <div
      className={cn(
        'rounded-xl border',
        isLight ? 'border-gray-200 bg-white' : 'border-border bg-black/40',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3',
          isLight ? 'border-gray-100' : 'border-white/10',
        )}
      >
        <p className={cn('text-sm font-semibold', isLight ? 'text-gray-900' : 'text-white')}>{title}</p>
        {ready && (
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              isLight ? 'text-gray-500' : 'text-muted',
            )}
          >
            {completed}/{fixes.length} done
          </span>
        )}
      </div>

      <ul className="m-0 list-none space-y-1 p-3">
        {fixes.map((fix, i) => {
          const checked = done[i]
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors',
                  isLight
                    ? checked
                      ? 'bg-emerald-50 text-gray-500'
                      : 'hover:bg-gray-50 text-gray-800'
                    : checked
                      ? 'bg-emerald-500/10 text-white/50'
                      : 'hover:bg-white/5 text-[#e8e8e8]',
                )}
              >
                {checked ? (
                  <CheckCircle2
                    className={cn('mt-0.5 size-4 shrink-0', isLight ? 'text-emerald-600' : 'text-emerald-400')}
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className={cn('mt-0.5 size-4 shrink-0', isLight ? 'text-gray-300' : 'text-white/30')}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    checked && 'line-through decoration-2',
                  )}
                >
                  {fix}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {allDone && (
        <p
          className={cn(
            'border-t px-4 py-3 text-sm',
            isLight ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
          )}
        >
          {allDoneLabel}
        </p>
      )}

      <div
        className={cn(
          'flex flex-col gap-2 border-t p-4 sm:flex-row',
          isLight ? 'border-gray-100' : 'border-white/10',
        )}
      >
        <Link
          href={resumeBuilderHref}
          className={cn(
            'inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            isLight
              ? 'bg-[#ff4500] text-white hover:bg-[#e63e00]'
              : 'border border-orange/60 bg-orange/10 text-orange hover:bg-orange/20',
          )}
        >
          {resumeBuilderLabel}
        </Link>
        <Link
          href={roastAgainHref}
          className={cn(
            'inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            isLight
              ? 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
              : 'border border-border bg-black/40 text-white hover:border-orange hover:text-orange',
          )}
        >
          {roastAgainLabel}
        </Link>
      </div>
    </div>
  )
}
