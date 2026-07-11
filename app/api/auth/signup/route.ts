import { NextResponse } from 'next/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getAuthCallbackUrl } from '@/lib/auth/redirects'
import {
  AUTH_BODY_INVALID,
  AUTH_SERVER_ERROR,
  AUTH_SIGNUP_INVALID,
  AUTH_SIGNUP_SUCCESS,
} from '@/lib/auth/messages'
import { parseSignUpBody } from '@/lib/auth/validation'

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: 'Auth not configured — add SUPABASE_ANON_KEY to .env.local' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    console.warn('[auth/signup] validation failed', { codes: ['invalid_json'] })
    return NextResponse.json({ error: AUTH_BODY_INVALID }, { status: 400 })
  }

  const parsed = parseSignUpBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: AUTH_SIGNUP_INVALID }, { status: 400 })
  }

  const { email, password, name } = parsed.data

  try {
    const supabase = createRouteHandlerClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: getAuthCallbackUrl(request),
      },
    })

    if (error) {
      console.warn('[auth/signup] provider rejected', { code: error.code ?? 'unknown' })
      // Do not reveal whether email already exists
      return NextResponse.json({
        ok: true,
        message: AUTH_SIGNUP_SUCCESS,
        needsEmailConfirm: true,
      })
    }

    return NextResponse.json({
      ok: true,
      message: AUTH_SIGNUP_SUCCESS,
      needsEmailConfirm: !data.session,
    })
  } catch (err) {
    console.error('[auth/signup]', err)
    return NextResponse.json({ error: AUTH_SERVER_ERROR }, { status: 500 })
  }
}
