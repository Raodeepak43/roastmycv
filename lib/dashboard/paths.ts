import { safeRedirectPath } from '@/lib/auth/redirects'
import {
  DASHBOARD_ORIGIN,
  getRequestHost,
  isDashboardHost,
  isDashboardPublicRoute,
  isLocalHost,
} from '@/lib/site/hosts'

/** `/dashboard/roast` → `/roast`, `/dashboard` → `/` */
export function toDashboardPublicPath(internalPath: string): string {
  if (internalPath === '/dashboard') return '/'
  if (internalPath.startsWith('/dashboard/')) {
    return internalPath.slice('/dashboard'.length) || '/'
  }
  return internalPath
}

/** `/roast` → `/dashboard/roast`, `/` → `/dashboard` */
export function toDashboardInternalPath(publicPath: string): string {
  if (publicPath === '/dashboard' || publicPath.startsWith('/dashboard/')) return publicPath
  if (publicPath === '/') return '/dashboard'
  return `/dashboard${publicPath}`
}

export function isDashboardInternalPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
}

/** Normalize browser path (subdomain `/roast` or `/dashboard/roast`) to internal `/dashboard/*`. */
export function normalizeDashboardPathname(pathname: string): string {
  if (isDashboardInternalPath(pathname)) return pathname
  if (pathname === '/') return '/dashboard'
  if (isDashboardPublicRoute(pathname)) return toDashboardInternalPath(pathname)
  return pathname
}

export function dashboardPathMatches(pathname: string, internalHref: string, exact = false): boolean {
  const path = normalizeDashboardPathname(pathname)
  if (exact) return path === internalHref
  return path === internalHref || path.startsWith(`${internalHref}/`)
}

/** Link href for dashboard routes — subdomain paths in prod, `/dashboard/*` on localhost. */
export function dashboardHref(internalPath: string, host?: string): string {
  const normalized = internalPath.startsWith('/') ? internalPath : `/${internalPath}`
  const resolvedHost =
    host ?? (typeof window !== 'undefined' ? window.location.hostname : undefined)

  if (resolvedHost && isLocalHost(resolvedHost)) return normalized
  if (!resolvedHost && typeof window === 'undefined' && !process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return normalized
  }
  if (resolvedHost && isDashboardHost(resolvedHost)) {
    return toDashboardPublicPath(normalized)
  }
  if (typeof window !== 'undefined' && isDashboardHost(window.location.hostname)) {
    return toDashboardPublicPath(normalized)
  }
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return toDashboardPublicPath(normalized)
  }
  return normalized
}

/** After sign-in, send dashboard routes to the dashboard subdomain in production. */
export function resolvePostAuthRedirect(next: string | null | undefined, request?: Request): string {
  const raw = safeRedirectPath(next, '/dashboard')
  const host = request ? getRequestHost(request) : undefined

  if (isLocalHost(host)) return raw

  let internal = raw
  if (!isDashboardInternalPath(raw) && isDashboardPublicRoute(raw)) {
    internal = toDashboardInternalPath(raw)
  }

  if (!isDashboardInternalPath(internal)) return raw

  const publicPath = toDashboardPublicPath(internal)
  return `${DASHBOARD_ORIGIN}${publicPath === '/' ? '' : publicPath}`
}

/** Client navigation after auth — cross-subdomain uses full page load. */
export function navigateAfterAuth(
  next: string | null | undefined,
  push: (path: string) => void,
  refresh: () => void,
): void {
  const target = resolvePostAuthRedirect(next)
  if (target.startsWith('http://') || target.startsWith('https://')) {
    window.location.href = target
    return
  }
  push(target)
  refresh()
}

export function mainSiteLoginUrl(nextInternalPath = '/dashboard'): string {
  const next = encodeURIComponent(nextInternalPath)
  return `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''}/login?next=${next}`
}

export function isOnDashboardHost(): boolean {
  if (typeof window === 'undefined') return false
  return isDashboardHost(window.location.hostname)
}
