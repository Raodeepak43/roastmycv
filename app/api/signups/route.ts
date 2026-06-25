import { NextResponse } from 'next/server'

declare global {
  // eslint-disable-next-line no-var
  var roastTicker: { name: string; score?: number }[] | undefined
}

global.roastTicker = global.roastTicker ?? [
  { name: 'Arjun', score: 3 },
  { name: 'Neha', score: 7 },
  { name: 'Rohan', score: 2 },
  { name: 'Priya', score: 5 },
]

function toMessage(entry: { name: string; score?: number }) {
  const first = entry.name.trim().split(/\s+/)[0]
  if (entry.score != null) {
    return `💀 ${first} got roasted — ${entry.score}/10`
  }
  return `🔥 ${first} ne apni CV roast karwai`
}

export async function GET() {
  const items = (global.roastTicker ?? []).slice(-20).map(toMessage)
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length < 2 || name.length > 30) {
      return NextResponse.json({ error: 'Valid name required' }, { status: 400 })
    }

    const score = typeof body.score === 'number' ? body.score : undefined
    const entry = { name, score }

    global.roastTicker = [...(global.roastTicker ?? []), entry].slice(-50)
    return NextResponse.json({ items: global.roastTicker.map(toMessage) })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
