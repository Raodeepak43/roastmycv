'use client'

import { useEffect, useState } from 'react'
import {
  applyPrefill,
  countFilledFields,
  parseExtractedResume,
} from '@/lib/resume-builder/prefill'
import type { ResumeData } from '@/lib/resume-builder/types'
import {
  loadCachedPrefill,
  loadRoastResumeText,
  saveCachedPrefill,
} from '@/lib/roast/resume-text'

export type PrefillStatus = 'idle' | 'loading' | 'done' | 'empty' | 'error'

export function useRoastPrefill(setData: (data: ResumeData) => void) {
  const [fromRoast, setFromRoast] = useState('')
  const [status, setStatus] = useState<PrefillStatus>('idle')
  const [filledCount, setFilledCount] = useState(0)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('fromRoast')?.trim() ?? ''
    setFromRoast(id)
    if (!id) return

    let cancelled = false

    ;(async () => {
      setStatus('loading')

      const cached = loadCachedPrefill(id)
      if (cached) {
        const data = applyPrefill(parseExtractedResume(cached))
        if (!cancelled) {
          setData(data)
          setFilledCount(countFilledFields(data))
          setStatus('done')
        }
        return
      }

      const text = loadRoastResumeText(id)
      if (!text) {
        if (!cancelled) setStatus('empty')
        return
      }

      try {
        const res = await fetch('/api/resume-builder/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        const json = await res.json()
        if (!res.ok || !json.data) throw new Error(json.error ?? 'Extract failed')

        saveCachedPrefill(id, json.data)
        const data = applyPrefill(parseExtractedResume(json.data))
        if (!cancelled) {
          setData(data)
          setFilledCount(countFilledFields(data))
          setStatus('done')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [setData])

  return { fromRoast, status, filledCount }
}
