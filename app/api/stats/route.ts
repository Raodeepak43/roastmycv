import { NextResponse } from 'next/server'
import { getStatsCount, incrementStatsCount } from '@/lib/stats'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStore = { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }

export async function GET() {
  const count = await getStatsCount()
  return NextResponse.json({ count }, noStore)
}

export async function POST() {
  const count = await incrementStatsCount()
  return NextResponse.json({ count }, noStore)
}
