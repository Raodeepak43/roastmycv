import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { resolvePostAuthRedirect } from '@/lib/dashboard/paths'
import { touchIdleSessionCookie } from '@/lib/auth/idle-session'
import { getSiteOrigin, safeRedirectPath } from '@/lib/auth/redirects'
import { mergeAuthCookieOptions } from '@/lib/supabase/cookie-options'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'), '/dashboard')
  const origin = getSiteOrigin(request)

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!code || !url || !key) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, mergeAuthCookieOptions(options)),
        )
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[auth/callback]', error.message)
    const isRecovery = safeRedirectPath(searchParams.get('next'), '/dashboard') === '/login/update-password'
    const loginError = isRecovery ? 'reset_expired' : 'auth'
    return NextResponse.redirect(`${origin}/login/forgot-password?error=${loginError}`)
  }

  const redirect = NextResponse.redirect(resolvePostAuthRedirect(next, request))
  touchIdleSessionCookie(redirect)
  return redirect
}
