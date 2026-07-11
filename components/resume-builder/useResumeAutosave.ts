'use client'

import { useEffect, useRef, useState } from 'react'
import type { ResumeData } from '@/lib/resume-builder/types'
import { saveResumeDraft } from '@/lib/resume-builder/draft-storage'

export type ResumeSaveStatus = 'saved' | 'unsaved' | 'saving'

const DEBOUNCE_MS = 1500

export function useResumeAutosave(
  data: ResumeData,
  storageKey: string,
  enabled = true,
  wizardStep?: number,
) {
  const [status, setStatus] = useState<ResumeSaveStatus>('saved')
  const skipNext = useRef(true)
  const lastSaved = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return

    const serialized = JSON.stringify({ data, wizardStep })

    if (skipNext.current) {
      skipNext.current = false
      lastSaved.current = serialized
      return
    }

    if (serialized === lastSaved.current) return

    setStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setStatus('saving')
      try {
        saveResumeDraft(storageKey, data, wizardStep)
        lastSaved.current = serialized
        setStatus('saved')
      } catch {
        setStatus('unsaved')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, storageKey, enabled, wizardStep])

  return status
}
