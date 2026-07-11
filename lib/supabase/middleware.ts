import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  clearIdleSessionCookie,
  isIdleSessionExpired,
  touchIdleSessionCookie,
} from '@/lib/auth/idle-session'
import { toDashboardInternalPath, toDashboardPublicPath } from '@/lib/dashboard/paths'
import { mergeAuthCookieOptions } from '@/lib/supabase/cookie-options'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'
import {
  getRequestHost,
  isDashboardHost,
  isDashboardHostPassThrough,
  isDashboardSubdomainRoutingEnabled,
} from '@/lib/site/hosts'

function effectiveDashboardPath(pathname: string, host: string): string {
  if (isDashboardHost(host) && !isDashboardHostPassThrough(pathname)) {
    return toDashboardInternalPath(pathname)
  }
  return pathname
}

function requiresDashboardAuth(pathname: string, host: string): boolean {
  const effective = effectiveDashboardPath(pathname, host)
  return effective === '/dashboard' || effective.startsWith('/dashboard/')
}

function shouldSkipIdleEnforcement(pathname: string): boolean {
  return pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/callback')
}

function requiresIdleEnforcement(pathname: string, host: string, hasUser: boolean): boolean {
  if (!hasUser || shouldSkipIdleEnforcement(pathname)) return false
  if (requiresDashboardAuth(pathname, host) || pathname.startsWith('/api/dashboard/')) return true
  if (pathname.startsWith('/login')) return false
  return pathname === '/' || pathname.startsWith('/roast/')
}

function loginRedirectUrl(request: NextRequest, host: string, pathname: string): URL {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('reason', 'session_expired')
  if (requiresDashboardAuth(pathname, host)) {
    const nextPath =
      isDashboardHost(host) && isDashboardSubdomainRoutingEnabled(host)
        ? toDashboardPublicPath(effectiveDashboardPath(pathname, host))
        : effectiveDashboardPath(pathname, host)
    redirectUrl.searchParams.set('next', nextPath)
  } else {
    redirectUrl.searchParams.delete('next')
  }
  return redirectUrl
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, mergeAuthCookieOptions(options)),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const host = getRequestHost(request)
  const { pathname } = request.nextUrl

  if (user && requiresIdleEnforcement(pathname, host, true) && isIdleSessionExpired(request)) {
    await supabase.auth.signOut()
    if (pathname.startsWith('/api/dashboard/')) {
      const apiRes = NextResponse.json(
        { error: 'Session expired due to inactivity', code: 'session_expired' },
        { status: 401 },
      )
      clearIdleSessionCookie(apiRes)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        apiRes.cookies.set(cookie.name, cookie.value)
      })
      return apiRes
    }
    const redirectRes = NextResponse.redirect(loginRedirectUrl(request, host, pathname))
    clearIdleSessionCookie(redirectRes)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value)
    })
    return redirectRes
  }

  if (requiresDashboardAuth(pathname, host) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    const nextPath =
      isDashboardHost(host) && isDashboardSubdomainRoutingEnabled(host)
        ? toDashboardPublicPath(effectiveDashboardPath(pathname, host))
        : effectiveDashboardPath(pathname, host)
    redirectUrl.searchParams.set('next', nextPath)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/login') && user) {
    if (
      pathname.startsWith('/login/update-password') ||
      pathname.startsWith('/login/forgot-password')
    ) {
      touchIdleSessionCookie(supabaseResponse)
      return supabaseResponse
    }
    touchIdleSessionCookie(supabaseResponse)
    const redirectUrl = request.nextUrl.clone()
    if (isDashboardHost(host) && isDashboardSubdomainRoutingEnabled(host)) {
      redirectUrl.pathname = '/'
      redirectUrl.search = ''
    } else {
      redirectUrl.pathname = '/dashboard'
      redirectUrl.search = ''
    }
    const redirectRes = NextResponse.redirect(redirectUrl)
    touchIdleSessionCookie(redirectRes)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value)
    })
    return redirectRes
  }

  if (user && requiresIdleEnforcement(pathname, host, true)) {
    touchIdleSessionCookie(supabaseResponse)
  }

  return supabaseResponse
}
