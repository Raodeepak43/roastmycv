import type { NextRequest, NextResponse } from 'next/server'

/** Inactivity limit — user must interact within this window or is signed out. */
export const SESSION_IDLE_MS = 30 * 60 * 1000 // 30 minutes

export const SESSION_IDLE_COOKIE = 'rcv_last_active'

export function idleSessionCookieOptions(maxAgeSec = Math.ceil(SESSION_IDLE_MS / 1000) + 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  }
}

export function readLastActiveMs(request: NextRequest): number | null {
  const raw = request.cookies.get(SESSION_IDLE_COOKIE)?.value
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function isIdleSessionExpired(request: NextRequest, now = Date.now()): boolean {
  const last = readLastActiveMs(request)
  if (last === null) return false
  return now - last > SESSION_IDLE_MS
}

export function touchIdleSessionCookie(response: NextResponse, now = Date.now()): void {
  response.cookies.set(SESSION_IDLE_COOKIE, String(now), idleSessionCookieOptions())
}

export function clearIdleSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_IDLE_COOKIE, '', {
    ...idleSessionCookieOptions(0),
    maxAge: 0,
  })
}
