'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { mergeHistory, mergeUsage, importSessionRoastsToClient } from '@/lib/dashboard/client-store'

export interface DashboardMeUsage {
  plan: 'free' | 'pro'
  roastsUsed: number
  roastsLimit: number
  roastsLeft: number
}

export interface DashboardRecentRoast {
  id: string
  score: number
  title: string | null
  file_name: string | null
  created_at: string
}

interface DashboardDataContextValue {
  loading: boolean
  usage: DashboardMeUsage
  recentRoasts: DashboardRecentRoast[]
  memberSince: string
  createdAt: string | null
  dbReady: boolean
  refresh: () => Promise<void>
}

const defaultUsage: DashboardMeUsage = {
  plan: 'free',
  roastsUsed: 0,
  roastsLimit: 2,
  roastsLeft: 2,
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null)

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useDashboardUser()
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<DashboardMeUsage>(defaultUsage)
  const [recentRoasts, setRecentRoasts] = useState<DashboardRecentRoast[]>([])
  const [memberSince, setMemberSince] = useState('—')
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [dbReady, setDbReady] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/me', { cache: 'no-store', credentials: 'include' })
      if (res.status === 401) {
        window.location.href = '/login?reason=session_expired'
        return
      }
      if (!res.ok) return
      const data = await res.json()
      const dbReady = Boolean(data.dbReady)
      if (!dbReady && userId) importSessionRoastsToClient(userId)
      const merged = mergeUsage(data.usage, userId, dbReady)
      setUsage({
        plan: data.usage?.plan === 'pro' ? 'pro' : 'free',
        roastsUsed: merged.roastsUsed,
        roastsLimit: merged.roastsLimit,
        roastsLeft: merged.roastsLeft,
      })
      setRecentRoasts(mergeHistory(data.recentRoasts ?? [], userId, dbReady))
      setDbReady(dbReady)
      if (data.user?.createdAt) {
        setCreatedAt(data.user.createdAt)
        setMemberSince(
          new Date(data.user.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            year: 'numeric',
          }),
        )
      }
    } catch {
      /* keep prior state */
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ loading, usage, recentRoasts, memberSince, createdAt, dbReady, refresh }),
    [loading, usage, recentRoasts, memberSince, createdAt, dbReady, refresh],
  )

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext)
  if (!ctx) throw new Error('useDashboardData must be used within DashboardDataProvider')
  return ctx
}
