import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `You are a career advisor helping a candidate compare job offers. Analyse 2-3 offers on: salary/comp, growth potential, culture signals from JD language, red flags, and overall fit. Recommend which to take and why. Provide a negotiation script for using a competing offer to improve the preferred one.

Format with these exact headings:
## Comparison table
## Recommendation
## Negotiation script`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('offer-compare')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { offers, salaryNotes } = body as { offers?: string[]; salaryNotes?: string }

    const valid = (offers ?? []).map((o) => o?.trim()).filter((o) => o && o.length >= 30)
    if (valid.length < 2) {
      return NextResponse.json({ error: 'Paste at least 2 job offers (min 30 chars each)' }, { status: 400 })
    }

    const block = valid.map((o, i) => `--- OFFER ${i + 1} ---\n${o}`).join('\n\n')

    const text = await completeToolText({
      system: SYSTEM,
      user: `${block}\n\nKNOWN SALARY INFO:\n${salaryNotes?.trim() || 'Not provided'}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'offer-compare', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[offer-compare]', err)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
