import { NextRequest, NextResponse } from 'next/server'
import {
  attachGuestSession,
  cvUsesLeft,
  incrementCv,
  readGuestSession,
} from '@/lib/guest-session'
import { FREE_LIMIT, isFingerprintPaid } from '@/lib/usage'

export const dynamic = 'force-dynamic'

const noStore = { headers: { 'Cache-Control': 'no-store, max-age=0' } }

export async function GET(req: NextRequest) {
  const session = readGuestSession(req)
  const fp = req.nextUrl.searchParams.get('fp')
  const paid = fp ? await isFingerprintPaid(fp) : false
  const usesLeft = cvUsesLeft(session, paid)
  const used = paid ? session.cv : Math.min(session.cv, FREE_LIMIT)

  const res = NextResponse.json({ usesLeft, used, paid }, noStore)
  attachGuestSession(res, session)
  return res
}

export async function POST(req: NextRequest) {
  let body: { fp?: string } = {}
  try {
    body = await req.json()
  } catch {
    /* optional body */
  }

  const session = readGuestSession(req)
  const fp = typeof body.fp === 'string' ? body.fp : null
  const paid = fp ? await isFingerprintPaid(fp) : false

  if (!paid && session.cv >= FREE_LIMIT) {
    const res = NextResponse.json({ usesLeft: 0, used: session.cv, paid: false }, { status: 429, ...noStore })
    attachGuestSession(res, session)
    return res
  }

  const nextSession = incrementCv(session)
  const usesLeft = cvUsesLeft(nextSession, paid)

  const res = NextResponse.json(
    { usesLeft, used: nextSession.cv, paid },
    noStore,
  )
  attachGuestSession(res, nextSession)
  return res
}
