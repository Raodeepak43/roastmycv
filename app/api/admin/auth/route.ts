import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, getAdminSessionToken, isAdminConfigured, verifyAdminSession } from '@/lib/admin/auth'
import { AUTH_SIGNIN_INVALID } from '@/lib/auth/messages'
import { verifyAdminPassword } from '@/lib/auth/password'
import {
  checkIpRateLimit,
  getClientIp,
  recordFailedLogin,
  sleep,
} from '@/lib/auth/rate-limit'

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin not configured — set ADMIN_PASSWORD' }, { status: 503 })
  }

  const ip = getClientIp(req)
  const ipCheck = await checkIpRateLimit(`admin:${ip}`)
  if (!ipCheck.allowed) {
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  const password = body.password ?? ''
  const valid = await verifyAdminPassword(password)

  if (!valid) {
    const adminKey = `admin:${process.env.ADMIN_PASSWORD_BCRYPT?.slice(0, 12) ?? 'legacy'}`
    const { delayMs } = await recordFailedLogin(adminKey)
    if (delayMs > 0) await sleep(delayMs)
    return NextResponse.json({ error: AUTH_SIGNIN_INVALID }, { status: 401 })
  }

  const token = getAdminSessionToken()!
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return NextResponse.json({ authenticated: verifyAdminSession(token) })
}
