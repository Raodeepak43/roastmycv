import { USER_FREE_ROASTS } from '@/lib/dashboard/constants'

export interface ClientHistoryItem {
  id: string
  score: number
  title: string | null
  verdict: string | null
  file_name: string | null
  created_at: string
  intensity?: string | null
  language?: string | null
}

interface ClientUsageRow {
  roastsUsed: number
}

const USAGE_PREFIX = 'mcr_dash_usage_'
const HISTORY_PREFIX = 'mcr_dash_history_'
const SESSION_INDEX = 'rcv_roast_ids'
const SESSION_PREFIX = 'rcv_roast_'
const MAX_HISTORY = 50

function usageKey(userId: string) {
  return `${USAGE_PREFIX}${userId}`
}

function historyKey(userId: string) {
  return `${HISTORY_PREFIX}${userId}`
}

export function getClientUsage(userId: string): ClientUsageRow {
  if (typeof window === 'undefined') return { roastsUsed: 0 }
  try {
    const raw = localStorage.getItem(usageKey(userId))
    if (!raw) return { roastsUsed: 0 }
    const parsed = JSON.parse(raw) as ClientUsageRow
    return { roastsUsed: Math.max(0, parsed.roastsUsed ?? 0) }
  } catch {
    return { roastsUsed: 0 }
  }
}

export function getClientHistory(userId: string): ClientHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(historyKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ClientHistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordClientRoast(
  userId: string,
  item: ClientHistoryItem,
): { roastsUsed: number; roastsLeft: number } {
  const usage = getClientUsage(userId)
  const nextUsed = usage.roastsUsed + 1
  localStorage.setItem(usageKey(userId), JSON.stringify({ roastsUsed: nextUsed }))

  const history = getClientHistory(userId).filter((r) => r.id !== item.id)
  history.unshift(item)
  localStorage.setItem(historyKey(userId), JSON.stringify(history.slice(0, MAX_HISTORY)))

  return {
    roastsUsed: nextUsed,
    roastsLeft: Math.max(0, USER_FREE_ROASTS - nextUsed),
  }
}

export interface ServerUsage {
  plan: string
  roastsUsed: number
  roastsLeft: number
  roastsLimit: number
}

export function importSessionRoastsToClient(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    const raw = sessionStorage.getItem(SESSION_INDEX)
    const ids: string[] = raw ? JSON.parse(raw) : []
    if (ids.length === 0) return

    const history = getClientHistory(userId)
    const seen = new Set(history.map((r) => r.id))
    let added = 0

    for (const id of ids) {
      if (seen.has(id)) continue
      const item = sessionStorage.getItem(SESSION_PREFIX + id)
      if (!item) continue
      const parsed = JSON.parse(item) as {
        score: number
        title?: string
        verdict?: string
        createdAt?: number
      }
      history.unshift({
        id,
        score: parsed.score,
        title: parsed.title ?? null,
        verdict: parsed.verdict ?? null,
        file_name: null,
        created_at: parsed.createdAt
          ? new Date(parsed.createdAt).toISOString()
          : new Date().toISOString(),
      })
      seen.add(id)
      added++
    }

    if (added > 0) {
      const trimmed = history.slice(0, MAX_HISTORY)
      localStorage.setItem(historyKey(userId), JSON.stringify(trimmed))
      const usage = getClientUsage(userId)
      localStorage.setItem(
        usageKey(userId),
        JSON.stringify({ roastsUsed: Math.max(usage.roastsUsed, trimmed.length) }),
      )
    }
  } catch {
    /* ignore */
  }
}

export function clearClientDashboardCache(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.removeItem(usageKey(userId))
    localStorage.removeItem(historyKey(userId))
  } catch {
    /* ignore */
  }
}

export function mergeUsage(
  server: ServerUsage | null | undefined,
  userId: string,
  dbReady: boolean,
): ServerUsage {
  const base: ServerUsage = server ?? {
    plan: 'free',
    roastsUsed: 0,
    roastsLeft: USER_FREE_ROASTS,
    roastsLimit: USER_FREE_ROASTS,
  }

  if (dbReady) {
    clearClientDashboardCache(userId)
    return base
  }

  const client = getClientUsage(userId)
  const roastsUsed = Math.max(base.roastsUsed, client.roastsUsed)
  return {
    ...base,
    roastsUsed,
    roastsLeft: Math.max(0, USER_FREE_ROASTS - roastsUsed),
    roastsLimit: USER_FREE_ROASTS,
  }
}

export function mergeHistory(
  serverRoasts: ClientHistoryItem[],
  userId: string,
  dbReady: boolean,
): ClientHistoryItem[] {
  if (dbReady) {
    clearClientDashboardCache(userId)
    return serverRoasts
  }

  const client = getClientHistory(userId)
  if (client.length === 0) return serverRoasts

  const seen = new Set<string>()
  const merged: ClientHistoryItem[] = []
  for (const r of [...client, ...serverRoasts]) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    merged.push(r)
  }
  return merged.slice(0, MAX_HISTORY)
}
