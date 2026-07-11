import { NextRequest, NextResponse } from 'next/server'
import { getPublicRoastByToken, setPublicRoastVisibility } from '@/lib/public-roasts'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const row = await getPublicRoastByToken(params.token)
    if (!row || !row.is_public) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      roast: {
        score: row.score,
        intensity: row.intensity,
        language: row.language,
        summary: row.summary,
        top_issues: row.top_issues,
        share_token: row.share_token,
        created_at: row.created_at,
      },
    })
  } catch (err) {
    console.error('[public-roasts GET]', err)
    return NextResponse.json({ error: 'Failed to load roast' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    let body: { is_public?: boolean }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    if (typeof body.is_public !== 'boolean') {
      return NextResponse.json({ error: 'is_public required' }, { status: 400 })
    }

    const existing = await getPublicRoastByToken(params.token)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const ok = await setPublicRoastVisibility(params.token, body.is_public)
    if (!ok) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, is_public: body.is_public })
  } catch (err) {
    console.error('[public-roasts PATCH]', err)
    return NextResponse.json({ error: 'Failed to update roast' }, { status: 500 })
  }
}
