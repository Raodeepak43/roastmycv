import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('cv-rewriter')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { bullets, targetRole } = body as { bullets?: string[]; targetRole?: string }

    const list = Array.isArray(bullets) ? bullets.map(String).filter((b) => b.trim()) : []
    if (list.length === 0) {
      return NextResponse.json({ error: 'At least one bullet required' }, { status: 400 })
    }

    if (!auth.gate.isPro && list.length > 5) {
      return NextResponse.json({ error: 'Free tier: max 5 bullets per day' }, { status: 429 })
    }

    const roleHint = targetRole?.trim() ? ` for ${targetRole.trim()}` : ''

    const SYSTEM = `Rewrite each CV bullet point to be stronger. Rules: start with a strong action verb, add specific metrics where possible (if none given, use relative language like 'by 40%' only if the original implies scale — do NOT make up numbers), remove filler phrases like 'responsible for' or 'helped with', keep to 1 line max, make it ATS-friendly${roleHint}. Return ONLY valid JSON: {"rows":[{"original":"...","rewritten":"..."}],"principles":["..."]}. Do not change factual content.`

    const raw = await completeToolText({
      system: SYSTEM,
      user: list.join('\n'),
      maxTokens: 4096,
    })

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { rows: [], principles: [] }

    await finishToolUse(auth.user.id, 'cv-rewriter', auth.gate.isPro, { result: parsed })
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[cv-rewriter]', err)
    return NextResponse.json({ error: 'Rewrite failed' }, { status: 500 })
  }
}
