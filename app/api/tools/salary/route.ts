import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Write a salary negotiation script for a job candidate. Be direct and confident, not aggressive. Use market-rate framing, not desperation. Include: 1) How to answer 'what are your salary expectations' without anchoring too low, 2) A counter-offer script if they've already made an offer, 3) A pushback response if they say budget is fixed, 4) A graceful acceptance script. Base the numbers on the inputs provided. India job market context if location is Indian city.

Format with headings:
## When they ask your expectations (before offer)
## Counter-offer response
## If they push back
## Accepting gracefully

Mark each section with [Say this] or [Email this] as appropriate.`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('salary')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { currentOffer, targetSalary, yearsExp, role, location } = body as {
      currentOffer?: string
      targetSalary?: string
      yearsExp?: number
      role?: string
      location?: string
    }

    if (!targetSalary?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Target salary and role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `Role: ${role.trim()}\nLocation: ${location?.trim() || 'India'}\nYears experience: ${yearsExp ?? 'Not specified'}\nCurrent offer (₹/year): ${currentOffer?.trim() || 'None yet'}\nTarget salary (₹/year): ${targetSalary.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'salary', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[salary]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
