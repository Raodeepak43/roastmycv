import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, parseJsonFromLlm } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Scan CVs for elements that might trigger unconscious bias in hiring. Flag: age indicators, religious/caste signals, gender markers, family status mentions, college tier signals, photo mentions, nationality/visa info. For each flag: type, what was found, what it reveals, risk level (Low/Medium/High), how to neutralise. Be factual and non-judgmental. Note: flagging is not endorsing bias — it helps candidates make informed choices.

Return ONLY valid JSON:
{
  "flags": [{"type":"Age indicator|Religion/caste|Gender|College tier|Family status|Photo|Nationality/visa","found":"...","reveals":"...","risk":"Low|Medium|High","neutralise":"..."}],
  "summary": "1-2 sentence overview"
}`

type BiasResult = {
  flags: { type: string; found: string; reveals: string; risk: string; neutralise: string }[]
  summary: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('bias-check')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, country } = body as { cv?: string; country?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }

    const raw = await completeToolText({
      system: SYSTEM.replace('[country]', country?.trim() || 'India'),
      user: `TARGET MARKET: ${country?.trim() || 'India'}\n\nCV:\n${cv!.trim()}`,
    })

    const parsed = parseJsonFromLlm<BiasResult>(raw)
    await finishToolUse(auth.user.id, 'bias-check', auth.gate.isPro, { result: parsed })
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[bias-check]', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
