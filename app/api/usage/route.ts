import { NextRequest, NextResponse } from 'next/server'
import { FREE_LIMIT, getUsesLeft, getUsedCount, incrementUsage } from '@/lib/usage'

export const dynamic = 'force-dynamic'

const noStore = { headers: { 'Cache-Control': 'no-store, max-age=0' } }

export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get('fp')
  if (!fp) {
    return NextResponse.json({ usesLeft: FREE_LIMIT, used: 0 }, noStore)
  }
  const used = await getUsedCount(fp)
  const usesLeft = await getUsesLeft(fp)
  return NextResponse.json({ usesLeft, used }, noStore)
}

export async function POST(req: NextRequest) {
  let body: { fp?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { fp } = body
  if (!fp || typeof fp !== 'string') {
    return NextResponse.json({ error: 'No fingerprint' }, { status: 400 })
  }

  const result = await incrementUsage(fp)
  return NextResponse.json(result, noStore)
}
