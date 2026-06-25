import { NextResponse } from 'next/server'

declare global {
  // eslint-disable-next-line no-var
  var roastCount: number | undefined
}

global.roastCount = global.roastCount ?? 1250

export async function GET() {
  return NextResponse.json({ count: global.roastCount })
}

export async function POST() {
  global.roastCount = (global.roastCount ?? 1250) + 1
  return NextResponse.json({ count: global.roastCount })
}
