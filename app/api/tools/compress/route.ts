import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, parseJsonFromLlm } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `Compress CVs to fit on 1 page (target ~500-600 words max). Rules: keep all jobs from last 5 years, keep quantified achievements, remove: old jobs 10+ years ago (keep company name only), generic skills everyone has, filler phrases, duplicate information, objective statements. Prioritise content relevant to the target role.

Return ONLY valid JSON:
{
  "cut": [{"item":"...","reason":"too old|irrelevant for role|too vague|redundant"}],
  "compressedCv": "full 1-page CV text with clean formatting",
  "restoreRanked": [{"item":"...","reason":"worth adding back if..."}]
}`

type CompressResult = {
  cut: { item: string; reason: string }[]
  compressedCv: string
  restoreRanked: { item: string; reason: string }[]
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('compress')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, targetRole } = body as { cv?: string; targetRole?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }
    if (!targetRole?.trim()) {
      return NextResponse.json({ error: 'Target role required' }, { status: 400 })
    }

    const raw = await completeToolText({
      system: SYSTEM,
      user: `TARGET ROLE: ${targetRole.trim()}\n\nCV:\n${cv!.trim()}`,
      maxTokens: 4096,
    })

    const parsed = parseJsonFromLlm<CompressResult>(raw)
    await finishToolUse(auth.user.id, 'compress', auth.gate.isPro, { result: parsed })
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[compress]', err)
    return NextResponse.json({ error: 'Compression failed' }, { status: 500 })
  }
}
