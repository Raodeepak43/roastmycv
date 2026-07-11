import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TONE_LABELS: Record<string, string> = {
  storytelling: 'Storytelling',
  achievement: 'Achievement-led',
  keyword: 'Keyword-rich',
}

const SYSTEM = `You are a LinkedIn profile expert. Write 3 compelling LinkedIn About sections based on the CV provided. Each should be 150-200 words, first-person, no buzzwords like 'passionate' or 'results-driven'. Version 1: storytelling arc. Version 2: opens with biggest achievement, bullet-led. Version 3: keyword-optimised for recruiter searches. Separate each with '---VERSION---'.

After each version include a line: Best for: [one short phrase]`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('linkedin')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, tone = 'storytelling' } = body as { cv?: string; tone?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }

    const toneLabel = TONE_LABELS[tone] ?? 'Storytelling'

    const text = await completeToolText({
      system: SYSTEM,
      user: `Preferred tone emphasis: ${toneLabel}\n\nCV:\n${cv!.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'linkedin', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[linkedin]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
