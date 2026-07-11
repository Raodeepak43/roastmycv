import type { NextRequest, NextResponse } from 'next/server'
import { FREE_LIMIT } from '@/lib/usage'

export const GUEST_SESSION_COOKIE = 'rcv_guest'

export type GuestSession = {
  sid: string
  cv: number
  li: number
}

function newSession(): GuestSession {
  return { sid: crypto.randomUUID(), cv: 0, li: 0 }
}

function parseSession(raw: string | undefined): GuestSession | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as Partial<GuestSession>
    if (
      typeof p.sid === 'string' &&
      typeof p.cv === 'number' &&
      typeof p.li === 'number' &&
      p.cv >= 0 &&
      p.li >= 0
    ) {
      return { sid: p.sid, cv: p.cv, li: p.li }
    }
  } catch {
    /* invalid cookie */
  }
  return null
}

export function readGuestSession(req: NextRequest): GuestSession {
  return parseSession(req.cookies.get(GUEST_SESSION_COOKIE)?.value) ?? newSession()
}

export function attachGuestSession(res: NextResponse, session: GuestSession): void {
  res.cookies.set(GUEST_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export function cvUsesLeft(session: GuestSession, paid: boolean): number {
  if (paid) return 999
  return Math.max(0, FREE_LIMIT - session.cv)
}

export function liUsesLeft(session: GuestSession, paid: boolean, limit: number): number {
  if (paid) return 999
  return Math.max(0, limit - session.li)
}

export function isCvLimitReached(session: GuestSession, paid: boolean): boolean {
  return !paid && session.cv >= FREE_LIMIT
}

export function isLiLimitReached(session: GuestSession, paid: boolean, limit: number): boolean {
  return !paid && session.li >= limit
}

export function incrementCv(session: GuestSession): GuestSession {
  return { ...session, cv: session.cv + 1 }
}

export function incrementLi(session: GuestSession): GuestSession {
  return { ...session, li: session.li + 1 }
}
