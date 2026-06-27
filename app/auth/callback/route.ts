import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

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
          cookieStore.set(name, value, options),
        )
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[auth/callback]', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`)
  }
  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  }
  return NextResponse.redirect(`${origin}${next}`)
}
