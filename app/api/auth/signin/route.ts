import { NextResponse } from 'next/server'
import { touchIdleSessionCookie } from '@/lib/auth/idle-session'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { sendLockoutResetEmail } from '@/lib/auth/lockout-email'
import { AUTH_BODY_INVALID, AUTH_SERVER_ERROR, AUTH_SIGNIN_INVALID } from '@/lib/auth/messages'
import {
  checkIpRateLimit,
  clearLoginFailures,
  getAccountLockState,
  getClientIp,
  recordFailedLogin,
  sleep,
} from '@/lib/auth/rate-limit'
import { parseSignInBody } from '@/lib/auth/validation'

async function failLogin(email: string, request: Request): Promise<NextResponse> {
  const { newlyLocked, delayMs } = await recordFailedLogin(email)
  if (newlyLocked) {
    void sendLockoutResetEmail(email, request)
  }
  if (delayMs > 0) await sleep(delayMs)
  return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
}

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: 'Auth not configured — add SUPABASE_ANON_KEY to .env.local' },
      { status: 503 },
    )
  }

  const ip = getClientIp(request)
  const ipCheck = await checkIpRateLimit(ip)
  if (!ipCheck.allowed) {
    console.warn('[auth/signin] ip rate limited', { ipHash: ip.slice(0, 8) })
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    console.warn('[auth/signin] validation failed', { codes: ['invalid_json'] })
    return NextResponse.json({ error: AUTH_BODY_INVALID }, { status: 400 })
  }

  const parsed = parseSignInBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  const { email, password } = parsed.data

  const lockState = await getAccountLockState(email)
  if (lockState.locked) {
    console.warn('[auth/signin] locked account attempt', {
      emailHash: email.slice(0, 3) + '…',
    })
    await sleep(Math.min(lockState.failures * 500, 5000))
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  try {
    const response = NextResponse.json({ ok: true })
    const supabase = createRouteHandlerClient(response)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.warn('[auth/signin] provider rejected', { code: error.code ?? 'unknown' })
      return failLogin(email, request)
    }
    await clearLoginFailures(email)
    touchIdleSessionCookie(response)
    return response
  } catch (err) {
    console.error('[auth/signin]', err)
    return NextResponse.json({ error: AUTH_SERVER_ERROR }, { status: 500 })
  }
}
