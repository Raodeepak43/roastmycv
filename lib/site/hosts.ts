/** Dashboard subdomain — user workspace lives here in production. */
export const DASHBOARD_HOST =
  process.env.NEXT_PUBLIC_DASHBOARD_HOST?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
  'dashboard.mycvroast.in'

export const DASHBOARD_ORIGIN =
  process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(/\/$/, '') || `https://${DASHBOARD_HOST}`

export const MAIN_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.mycvroast.in'

export const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? process.env.COOKIE_DOMAIN?.trim() || '.mycvroast.in'
    : undefined

export function normalizeHost(host: string | null | undefined): string {
  return (host ?? '').split(':')[0].toLowerCase()
}

export function getRequestHost(request: Pick<Request, 'headers'> & { nextUrl?: { host: string } }): string {
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (forwarded) return normalizeHost(forwarded)
  if (request.nextUrl?.host) return normalizeHost(request.nextUrl.host)
  try {
    return normalizeHost(new URL((request as Request).url).hostname)
  } catch {
    return ''
  }
}

export function isLocalHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host)
  return h === 'localhost' || h === '127.0.0.1'
}

export function isDashboardHost(host: string | null | undefined): boolean {
  return normalizeHost(host) === normalizeHost(DASHBOARD_HOST)
}

/** Main-site `/dashboard` → subdomain redirects (off on localhost). */
export function isDashboardSubdomainRoutingEnabled(host: string | null | undefined): boolean {
  return !isLocalHost(host)
}

/** Paths on the dashboard host that are not rewritten to `/dashboard/*`. */
export function isDashboardHostPassThrough(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/og')
  )
}

/** Public URL segments served by `app/dashboard/*` on the dashboard host. */
const DASHBOARD_PUBLIC_PREFIXES = [
  '/roast',
  '/history',
  '/resume-builder',
  '/tracker',
  '/plans',
  '/profile',
  '/settings',
  '/tools',
  '/billing',
] as const

export function isDashboardPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return DASHBOARD_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
