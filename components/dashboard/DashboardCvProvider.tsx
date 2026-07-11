'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import {
  clearClientDashboardCv,
  getClientDashboardCv,
  setClientDashboardCv,
  type DashboardCvSource,
} from '@/lib/dashboard/saved-cv-client'
import { resumeDraftStorageKey, loadResumeDraft } from '@/lib/resume-builder/draft-storage'
import { resumeDataToText } from '@/lib/resume-builder/to-text'

interface DashboardCvContextValue {
  cv: string
  fileName: string | null
  source: DashboardCvSource | null
  hasCv: boolean
  loading: boolean
  editing: boolean
  setEditing: (v: boolean) => void
  saveCv: (text: string, opts?: { fileName?: string | null; source?: DashboardCvSource }) => Promise<{ ok: boolean; error?: string }>
  clearCv: () => Promise<void>
  refresh: () => Promise<void>
}

const DashboardCvContext = createContext<DashboardCvContextValue | null>(null)

export function DashboardCvProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useDashboardUser()
  const [cv, setCv] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [source, setSource] = useState<DashboardCvSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const applyRecord = useCallback(
    (text: string, meta?: { fileName?: string | null; source?: DashboardCvSource }) => {
      setCv(text)
      setFileName(meta?.fileName ?? null)
      setSource(meta?.source ?? null)
      setEditing(false)
    },
    [],
  )

  const refresh = useCallback(async (silent = false) => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (!silent) setLoading(true)
    try {
      const local = getClientDashboardCv(userId)
      if (local) {
        applyRecord(local.text, { fileName: local.fileName, source: local.source })
      }

      const res = await fetch('/api/dashboard/saved-cv')
      if (res.ok) {
        const data = await res.json()
        if (data.cv && typeof data.cv === 'string') {
          const serverUpdated = data.updatedAt ? new Date(data.updatedAt).getTime() : 0
          const localUpdated = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0
          if (!local || serverUpdated >= localUpdated) {
            applyRecord(data.cv, {
              fileName: data.fileName ?? null,
              source: (data.source as DashboardCvSource) ?? 'upload',
            })
            setClientDashboardCv(userId, {
              text: data.cv,
              fileName: data.fileName ?? null,
              source: (data.source as DashboardCvSource) ?? 'upload',
              updatedAt: data.updatedAt ?? new Date().toISOString(),
            })
            setLoading(false)
            return
          }
        }
      }

      if (!local) {
        const draft = loadResumeDraft(resumeDraftStorageKey(userId))
        if (draft) {
          const text = resumeDataToText(draft)
          if (text.length >= 50) {
            applyRecord(text, { fileName: 'Resume Builder', source: 'builder' })
          }
        }
      }
    } catch {
      /* keep local state */
    } finally {
      if (!silent) setLoading(false)
    }
  }, [userId, applyRecord])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onFocus = () => void refresh(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const saveCv = useCallback(
    async (text: string, opts?: { fileName?: string | null; source?: DashboardCvSource }) => {
      if (!userId) {
        return { ok: false, error: 'Sign in to save your CV.' }
      }

      const trimmed = text.trim()
      if (trimmed.length < 50) {
        return { ok: false, error: 'CV text is too short.' }
      }

      const record = {
        text: trimmed,
        fileName: opts?.fileName ?? fileName,
        source: opts?.source ?? source ?? 'upload',
        updatedAt: new Date().toISOString(),
      }

      applyRecord(trimmed, { fileName: record.fileName, source: record.source as DashboardCvSource })
      setClientDashboardCv(userId, record)

      try {
        const res = await fetch('/api/dashboard/saved-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cv: trimmed,
            fileName: record.fileName,
            source: record.source,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          // Local copy is saved — still usable on this device
          if (res.status === 503) {
            return { ok: true }
          }
          return { ok: false, error: (data as { error?: string }).error ?? 'Could not sync CV to server.' }
        }
      } catch {
        return { ok: true }
      }

      return { ok: true }
    },
    [userId, fileName, source, applyRecord],
  )

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string; fileName?: string; source?: DashboardCvSource }>).detail
      if (!detail?.text) return
      void saveCv(detail.text, {
        fileName: detail.fileName ?? null,
        source: detail.source ?? 'roast',
      })
    }
    window.addEventListener('mcr-dashboard-cv-sync', onSync)
    return () => window.removeEventListener('mcr-dashboard-cv-sync', onSync)
  }, [saveCv])

  const clearCv = useCallback(async () => {
    if (!userId) return
    clearClientDashboardCv(userId)
    setCv('')
    setFileName(null)
    setSource(null)
    setEditing(true)
    try {
      await fetch('/api/dashboard/saved-cv', { method: 'DELETE' })
    } catch {
      /* ignore */
    }
  }, [userId])

  const value = useMemo(
    () => ({
      cv,
      fileName,
      source,
      hasCv: cv.trim().length >= 50,
      loading,
      editing,
      setEditing,
      saveCv,
      clearCv,
      refresh,
    }),
    [cv, fileName, source, loading, editing, saveCv, clearCv, refresh],
  )

  return <DashboardCvContext.Provider value={value}>{children}</DashboardCvContext.Provider>
}

export function useDashboardCv() {
  const ctx = useContext(DashboardCvContext)
  if (!ctx) throw new Error('useDashboardCv must be used within DashboardCvProvider')
  return ctx
}
