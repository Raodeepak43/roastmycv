import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mergeAuthCookieOptions } from '@/lib/supabase/cookie-options'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

/** Supabase client for Route Handlers — reads SUPABASE_ANON_KEY from server env. */
export function createRouteHandlerClient(response?: NextResponse) {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    throw new Error('Supabase auth is not configured — add SUPABASE_ANON_KEY to .env.local')
  }

  const cookieStore = cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const merged = mergeAuthCookieOptions(options)
          cookieStore.set(name, value, merged)
          response?.cookies.set(name, value, merged)
        })
      },
    },
  })
}
