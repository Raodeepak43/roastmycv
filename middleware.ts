import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, getAdminSessionTokenEdge, verifyAdminSessionEdge } from '@/lib/admin/auth-edge'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value

    if (pathname === '/admin/login') {
      if (await verifyAdminSessionEdge(token)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.next()
    }

    if (!(await verifyAdminSessionEdge(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (!(await getAdminSessionTokenEdge())) {
      return NextResponse.redirect(new URL('/admin/login?error=config', request.url))
    }

    return NextResponse.next()
  }

  if (
    pathname === '/login' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth/')
  ) {
    return updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/dashboard/:path*', '/auth/:path*'],
}
