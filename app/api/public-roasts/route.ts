import { NextRequest, NextResponse } from 'next/server'
import type { IntensityKey } from '@/app/i18n'
import { savePublicRoast } from '@/lib/public-roasts'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let body: {
      score?: number
      intensity?: string
      language?: string
      lines?: string[]
      title?: string
      verdict?: string
      fixes?: string[]
    }

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const score = typeof body.score === 'number' ? Math.min(10, Math.max(1, Math.round(body.score))) : null
    const intensity = body.intensity as IntensityKey
    const language = typeof body.language === 'string' ? body.language : 'hinglish'
    const lines = Array.isArray(body.lines) ? body.lines.map(String).filter(Boolean) : []

    if (!score || !['clean', 'gaali_light', 'savage'].includes(intensity) || lines.length === 0) {
      return NextResponse.json({ error: 'Invalid roast payload' }, { status: 400 })
    }

    const row = await savePublicRoast({
      score,
      intensity,
      language,
      lines,
      title: body.title,
      verdict: body.verdict,
      fixes: Array.isArray(body.fixes) ? body.fixes.map(String) : undefined,
    })

    if (!row) {
      return NextResponse.json({ error: 'Could not save roast — database unavailable' }, { status: 503 })
    }

    return NextResponse.json({
      share_token: row.share_token,
      id: row.id,
      is_public: row.is_public,
    })
  } catch (err) {
    console.error('[public-roasts POST]', err)
    return NextResponse.json({ error: 'Failed to save roast' }, { status: 500 })
  }
}
