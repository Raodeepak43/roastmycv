import { authStoreDel, authStoreGet, authStoreSet, hashAuthKey } from '@/lib/auth/store'

const IP_LIMIT = 10
const IP_WINDOW_SEC = 60
const MAX_FAILURES = 5
const LOCKOUT_SEC = 15 * 60

type IpBucket = { count: number; windowStart: number }
type AccountBucket = { failures: number; lockedUntil: number }

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

/** Max 10 sign-in attempts per IP per minute */
export async function checkIpRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const key = `auth:ip:${hashAuthKey(ip)}`
  const now = Date.now()
  const bucket = parseJson<IpBucket>(await authStoreGet(key))

  if (!bucket || now - bucket.windowStart >= IP_WINDOW_SEC * 1000) {
    await authStoreSet(key, JSON.stringify({ count: 1, windowStart: now }), IP_WINDOW_SEC)
    return { allowed: true }
  }

  if (bucket.count >= IP_LIMIT) {
    console.warn('[auth/rate-limit] ip limit exceeded', { ipHash: hashAuthKey(ip) })
    return { allowed: false }
  }

  bucket.count += 1
  const ttl = Math.max(1, Math.ceil((IP_WINDOW_SEC * 1000 - (now - bucket.windowStart)) / 1000))
  await authStoreSet(key, JSON.stringify(bucket), ttl)
  return { allowed: true }
}

export async function getAccountLockState(email: string): Promise<{
  locked: boolean
  failures: number
  lockedUntil: number
}> {
  const key = `auth:acct:${hashAuthKey(email)}`
  const now = Date.now()
  const bucket = parseJson<AccountBucket>(await authStoreGet(key))

  if (!bucket) {
    return { locked: false, failures: 0, lockedUntil: 0 }
  }

  if (bucket.lockedUntil > now) {
    return { locked: true, failures: bucket.failures, lockedUntil: bucket.lockedUntil }
  }

  if (bucket.lockedUntil > 0 && bucket.lockedUntil <= now) {
    await authStoreDel(key)
    return { locked: false, failures: 0, lockedUntil: 0 }
  }

  return { locked: false, failures: bucket.failures, lockedUntil: 0 }
}

export async function recordFailedLogin(email: string): Promise<{
  failures: number
  newlyLocked: boolean
  delayMs: number
}> {
  const key = `auth:acct:${hashAuthKey(email)}`
  const now = Date.now()
  const bucket = parseJson<AccountBucket>(await authStoreGet(key))
  const failures = (bucket?.failures ?? 0) + 1
  const lockedUntil = failures >= MAX_FAILURES ? now + LOCKOUT_SEC * 1000 : 0
  const ttl = lockedUntil > 0 ? LOCKOUT_SEC : 60 * 60

  await authStoreSet(
    key,
    JSON.stringify({ failures, lockedUntil }),
    ttl,
  )

  if (lockedUntil > 0) {
    console.warn('[auth/rate-limit] account locked', {
      emailHash: hashAuthKey(email),
      failures,
    })
  }

  const delayMs = Math.min(failures * 500, 5000)
  return { failures, newlyLocked: lockedUntil > 0, delayMs }
}

export async function clearLoginFailures(email: string): Promise<void> {
  await authStoreDel(`auth:acct:${hashAuthKey(email)}`)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
