import { NextResponse } from 'next/server'
import { touchIdleSessionCookie } from '@/lib/auth/idle-session'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { AUTH_BODY_INVALID, AUTH_GOOGLE_INVALID, AUTH_SERVER_ERROR } from '@/lib/auth/messages'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: AUTH_SERVER_ERROR }, { status: 503 })
  }

  let body: { credential?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: AUTH_BODY_INVALID }, { status: 400 })
  }

  const credential = body.credential?.trim()
  if (!credential) {
    return NextResponse.json({ error: AUTH_GOOGLE_INVALID }, { status: 401 })
  }

  try {
    const response = NextResponse.json({ ok: true })
    const supabase = createRouteHandlerClient(response)
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    })

    if (error) {
      console.warn('[auth/google-token] provider rejected', { code: error.code ?? 'unknown' })
      return NextResponse.json({ error: AUTH_GOOGLE_INVALID }, { status: 401 })
    }

    touchIdleSessionCookie(response)
    return response
  } catch (err) {
    console.error('[auth/google-token]', err)
    return NextResponse.json({ error: AUTH_SERVER_ERROR }, { status: 500 })
  }
}
