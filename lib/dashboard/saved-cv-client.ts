const CV_PREFIX = 'mcr_dash_cv_'

export type DashboardCvSource = 'upload' | 'paste' | 'roast' | 'builder'

export interface DashboardCvRecord {
  text: string
  fileName: string | null
  source: DashboardCvSource
  updatedAt: string
}

function storageKey(userId: string) {
  return `${CV_PREFIX}${userId}`
}

export function getClientDashboardCv(userId: string): DashboardCvRecord | null {
  if (typeof window === 'undefined' || !userId) return null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as DashboardCvRecord
    if (!parsed.text || parsed.text.trim().length < 50) return null
    return parsed
  } catch {
    return null
  }
}

export function setClientDashboardCv(userId: string, record: DashboardCvRecord): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(record))
  } catch {
    /* ignore */
  }
}

export function clearClientDashboardCv(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    /* ignore */
  }
}
