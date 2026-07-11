import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `You are an onboarding coach. Given a candidate's CV, new role, and company context, write a detailed 30-60-90 day plan. Include specific actions per week: who to meet, what to learn, quick wins for early impact. Be role-specific and practical.

Format with these exact headings:
## Days 1-30: Learn & observe
## Days 31-60: Contribute & deliver
## Days 61-90: Lead & expand
## Week-by-week actions`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('ninety-days')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, role, companyType } = body as { cv?: string; role?: string; companyType?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }
    if (!role?.trim()) {
      return NextResponse.json({ error: 'New role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `NEW ROLE: ${role.trim()}\nCOMPANY SIZE/TYPE: ${companyType?.trim() || 'Not specified'}\n\nCV:\n${cv!.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'ninety-days', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[ninety-days]', err)
    return NextResponse.json({ error: 'Plan generation failed' }, { status: 500 })
  }
}
