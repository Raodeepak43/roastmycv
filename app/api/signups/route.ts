import { NextResponse } from 'next/server'
import {
  appendTickerEntry,
  entriesToMessages,
  getTickerEntries,
  TICKER_DISPLAY_COUNT,
} from '@/lib/ticker-store'
import { buildTickerMessage } from '@/lib/ticker'

export const dynamic = 'force-dynamic'

export async function GET() {
  const entries = await getTickerEntries()
  const items = entriesToMessages(entries, TICKER_DISPLAY_COUNT)
  return NextResponse.json({ items, entries: entries.slice(0, TICKER_DISPLAY_COUNT) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length < 2 || name.length > 30) {
      return NextResponse.json({ error: 'Valid name required' }, { status: 400 })
    }

    const score = typeof body.score === 'number' ? body.score : undefined
    const language = typeof body.language === 'string' ? body.language.trim().slice(0, 32) : undefined

    const entries = await appendTickerEntry({ name, score, language })
    const msg = buildTickerMessage(name, score, language)
    const items = entriesToMessages(entries, TICKER_DISPLAY_COUNT)

    return NextResponse.json({ items, message: msg })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
