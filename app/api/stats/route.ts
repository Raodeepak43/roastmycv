import { NextResponse } from 'next/server'

declare global {
  // eslint-disable-next-line no-var
  var roastCount: number | undefined
}

const SEED = 1250

if (global.roastCount === undefined || global.roastCount < SEED) {
  global.roastCount = SEED
}

export async function GET() {
  return NextResponse.json(
    { count: global.roastCount ?? SEED },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}

export async function POST() {
  global.roastCount = (global.roastCount ?? SEED) + 1
  return NextResponse.json(
    { count: global.roastCount },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
