import type { IntensityKey } from '@/app/i18n'

export type StoredRoast = {
  lines: string[]
  score: number
  intensity: IntensityKey
  language: string
  title?: string
  verdict?: string
  fixes?: string[]
  showTickerNamePrompt?: boolean
  createdAt: number
}

const PREFIX = 'rcv_roast_'
const INDEX_KEY = 'rcv_roast_ids'
const MAX_STORED = 8
const MAX_AGE_MS = 1000 * 60 * 60 * 24

function pruneIndex(): string[] {
  try {
    const raw = sessionStorage.getItem(INDEX_KEY)
    const ids: string[] = raw ? JSON.parse(raw) : []
    const now = Date.now()
    const kept = ids.filter((id) => {
      const item = sessionStorage.getItem(PREFIX + id)
      if (!item) return false
      try {
        const parsed = JSON.parse(item) as StoredRoast
        return now - parsed.createdAt < MAX_AGE_MS
      } catch {
        return false
      }
    })
    sessionStorage.setItem(INDEX_KEY, JSON.stringify(kept.slice(0, MAX_STORED)))
    return kept.slice(0, MAX_STORED)
  } catch {
    return []
  }
}

export function createRoastId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10)
}

export function saveRoast(id: string, data: Omit<StoredRoast, 'createdAt'>): void {
  const payload: StoredRoast = { ...data, createdAt: Date.now() }
  sessionStorage.setItem(PREFIX + id, JSON.stringify(payload))
  const ids = pruneIndex().filter((x) => x !== id)
  ids.unshift(id)
  sessionStorage.setItem(INDEX_KEY, JSON.stringify(ids.slice(0, MAX_STORED)))
}

export function loadRoast(id: string): StoredRoast | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + id)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredRoast
    if (Date.now() - parsed.createdAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}
