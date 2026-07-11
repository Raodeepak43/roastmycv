import { loadRoast } from '@/lib/roast-session'

const PREFILL_CACHE_PREFIX = 'rcv_prefill_'

export function loadRoastResumeText(roastId: string): string | null {
  const roast = loadRoast(roastId)
  const text = roast?.resumeText?.trim()
  return text && text.length >= 50 ? text : null
}

export function loadCachedPrefill(roastId: string): unknown | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${PREFILL_CACHE_PREFIX}${roastId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCachedPrefill(roastId: string, data: unknown) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(`${PREFILL_CACHE_PREFIX}${roastId}`, JSON.stringify(data))
  } catch {
    /* ignore quota */
  }
}
