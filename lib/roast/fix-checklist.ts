const PREFIX = 'rcv_fix_done_'

export function loadFixDone(roastId: string, fixCount: number): boolean[] {
  if (typeof window === 'undefined' || !roastId) {
    return Array.from({ length: fixCount }, () => false)
  }
  try {
    const raw = localStorage.getItem(`${PREFIX}${roastId}`)
    if (!raw) return Array.from({ length: fixCount }, () => false)
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return Array.from({ length: fixCount }, () => false)
    return Array.from({ length: fixCount }, (_, i) => Boolean(parsed[i]))
  } catch {
    return Array.from({ length: fixCount }, () => false)
  }
}

export function saveFixDone(roastId: string, done: boolean[]) {
  if (typeof window === 'undefined' || !roastId) return
  try {
    localStorage.setItem(`${PREFIX}${roastId}`, JSON.stringify(done))
  } catch {
    /* ignore quota errors */
  }
}
