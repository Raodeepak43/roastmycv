import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, getAdminSessionTokenEdge, verifyAdminSessionEdge } from '@/lib/admin/auth-edge'
import {
  getAdminLoginPath,
  isAdminLoginPath,
  isSecretAdminLoginEnabled,
  LEGACY_ADMIN_LOGIN_PATH,
} from '@/lib/admin/login-path'
import { toDashboardInternalPath, toDashboardPublicPath } from '@/lib/dashboard/paths'
import { updateSession } from '@/lib/supabase/middleware'
import {
  DASHBOARD_ORIGIN,
  getRequestHost,
  isDashboardHost,
  isDashboardHostPassThrough,
  isDashboardPublicRoute,
  isDashboardSubdomainRoutingEnabled,
  MAIN_SITE_ORIGIN,
} from '@/lib/site/hosts'

const NO_INDEX_HEADER = 'noindex, nofollow, noarchive, nosnippet'

function notFound() {
  return new NextResponse(null, { status: 404 })
}

function withNoIndex(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', NO_INDEX_HEADER)
  return res
}

function withDashboardNoStore(res: NextResponse): NextResponse {
  res.headers.set('CDN-Cache-Control', 'no-store')
  return res
}

function redirectMainSiteDashboard(request: NextRequest): NextResponse {
  const publicPath = toDashboardPublicPath(request.nextUrl.pathname)
  const dest = new URL(publicPath, DASHBOARD_ORIGIN)
  dest.search = request.nextUrl.search
  return NextResponse.redirect(dest, 308)
}

function copySessionCookies(from: NextResponse, into: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    into.cookies.set(cookie.name, cookie.value)
  })
  return into
}

async function handleDashboardHostRequest(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = request.nextUrl.clone()
    url.pathname = toDashboardPublicPath(pathname)
    return NextResponse.redirect(url, 308)
  }

  if (isDashboardHostPassThrough(pathname)) {
    return null
  }

  if (!isDashboardPublicRoute(pathname)) {
    const dest = new URL(pathname, MAIN_SITE_ORIGIN)
    dest.search = request.nextUrl.search
    return NextResponse.redirect(dest, 308)
  }

  const session = await updateSession(request)
  if (session.status >= 300 && session.status < 400) {
    return session
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = toDashboardInternalPath(pathname)
  const rewrite = NextResponse.rewrite(rewriteUrl)
  return withDashboardNoStore(withNoIndex(copySessionCookies(session, rewrite)))
}

export async function middleware(request: NextRequest) {
  const host = getRequestHost(request)
  const { pathname } = request.nextUrl
  const loginPath = getAdminLoginPath()
  const secretLogin = isSecretAdminLoginEnabled()
  const dashboardHost = isDashboardHost(host)
  const subdomainRouting = isDashboardSubdomainRoutingEnabled(host)

  if (dashboardHost && subdomainRouting) {
    const routed = await handleDashboardHostRequest(request)
    if (routed) return withNoIndex(routed)
  }

  if (
    !dashboardHost &&
    subdomainRouting &&
    (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))
  ) {
    return withNoIndex(redirectMainSiteDashboard(request))
  }

  if (isAdminLoginPath(pathname)) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value
    if (await verifyAdminSessionEdge(token)) {
      return withNoIndex(NextResponse.redirect(new URL('/admin', request.url)))
    }
    if (pathname === LEGACY_ADMIN_LOGIN_PATH && secretLogin) {
      return withNoIndex(notFound())
    }
    if (pathname !== LEGACY_ADMIN_LOGIN_PATH) {
      return withNoIndex(NextResponse.rewrite(new URL(LEGACY_ADMIN_LOGIN_PATH, request.url)))
    }
    return withNoIndex(NextResponse.next())
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value
    const authenticated = await verifyAdminSessionEdge(token)

    if (pathname === LEGACY_ADMIN_LOGIN_PATH) {
      return secretLogin ? withNoIndex(notFound()) : withNoIndex(NextResponse.next())
    }

    if (!authenticated) {
      if (secretLogin) {
        return withNoIndex(notFound())
      }
      return withNoIndex(NextResponse.redirect(new URL(loginPath, request.url)))
    }

    if (!(await getAdminSessionTokenEdge())) {
      const res = withNoIndex(notFound())
      res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
      return res
    }

    return withNoIndex(NextResponse.next())
  }

  const needsSession =
    pathname.startsWith('/login') ||
    pathname === '/' ||
    pathname.startsWith('/roast/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/dashboard/') ||
    pathname.startsWith('/auth/') ||
    (dashboardHost && subdomainRouting && isDashboardPublicRoute(pathname))

  if (needsSession) {
    const session = await updateSession(request)
    return dashboardHost ? withDashboardNoStore(withNoIndex(session)) : session
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/login',
    '/login/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/auth/:path*',
    '/roast/:path*',
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
      has: [{ type: 'host', value: 'dashboard.mycvroast.in' }],
    },
    '/((?!blog|guides|plans|privacy|terms|contact|linkedin-roast|resume-builder|login|dashboard|auth|admin|roast|api|og|icon|sitemap|robots|ads.txt|_next|favicon.ico)[^/.]+)',
  ],
}
