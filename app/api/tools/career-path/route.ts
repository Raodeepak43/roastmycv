import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, SONNET_MODEL } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `Based on the CV and priorities provided, map 3 realistic career paths. For each path provide:
- Path name + emoji
- 2-year milestone (specific role/level)
- 5-year milestone
- Top 3 skills to develop
- Salary trajectory (₹ range for India market — relative bands, not exact)
- Risk level: Low / Medium / High

Format exactly 3 cards separated by ---PATH---
## Path 1: Fast track
## Path 2: Lateral move
## Path 3: Big pivot

Be specific to their actual background, not generic.`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('career-path')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, priorities = [] } = body as { cv?: string; priorities?: string[] }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }

    const priorityText = Array.isArray(priorities) && priorities.length
      ? priorities.join(', ')
      : 'Not specified'

    const text = await completeToolText({
      system: SYSTEM,
      user: `Priorities: ${priorityText}\n\nCV:\n${cv!.trim()}`,
      model: SONNET_MODEL,
      maxTokens: 6000,
    })

    await finishToolUse(auth.user.id, 'career-path', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[career-path]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
