import { FREE_LIMIT } from '@/lib/usage'

/** Client fetch for guest roast quota — session cookie, optional fp for Pro status. */
export async function fetchGuestUsage(fp?: string): Promise<{
  usesLeft: number
  used: number
  paid: boolean
}> {
  const q = fp ? `?fp=${encodeURIComponent(fp)}` : ''
  const res = await fetch(`/api/usage${q}`, { cache: 'no-store', credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  return {
    usesLeft: typeof data.usesLeft === 'number' ? data.usesLeft : FREE_LIMIT,
    used: typeof data.used === 'number' ? data.used : 0,
    paid: Boolean(data.paid),
  }
}

export async function incrementGuestUsage(fp?: string): Promise<{
  usesLeft: number
  used: number
  paid: boolean
}> {
  const res = await fetch('/api/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(fp ? { fp } : {}),
  })
  const data = await res.json().catch(() => ({}))
  return {
    usesLeft: typeof data.usesLeft === 'number' ? data.usesLeft : 0,
    used: typeof data.used === 'number' ? data.used : 0,
    paid: Boolean(data.paid),
  }
}
