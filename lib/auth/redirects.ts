function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

/** Canonical site origin for OAuth redirects — prefers live request host over stale localhost env. */
export function getSiteOrigin(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`
    }

    const origin = new URL(request.url).origin
    if (!isLocalOrigin(origin)) return origin
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (fromEnv && !isLocalOrigin(fromEnv)) return fromEnv

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return fromEnv || 'http://localhost:3000'
}

/** Only allow same-site relative paths (blocks open redirects to localhost/other domains). */
export function safeRedirectPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallback
  }
  return next
}

export function getAuthCallbackUrl(request?: Request, next = '/dashboard'): string {
  const path = safeRedirectPath(next)
  return `${getSiteOrigin(request)}/auth/callback?next=${encodeURIComponent(path)}`
}

/** After email reset link — user lands on callback, then sets a new password here. */
export const PASSWORD_RESET_NEXT_PATH = '/login/update-password'

export function getPasswordResetCallbackUrl(request?: Request): string {
  return getAuthCallbackUrl(request, PASSWORD_RESET_NEXT_PATH)
}

/** Supabase → Google OAuth redirect URI (must be added in Google Cloud Console). */
export function getSupabaseGoogleRedirectUri(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!url) return null
  return `${url.replace(/\/$/, '')}/auth/v1/callback`
}
