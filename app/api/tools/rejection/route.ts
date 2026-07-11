import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { finishToolUse, requireToolUser } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const STAGE_LABELS: Record<string, string> = {
  screening: 'After CV screening',
  first: 'After first interview',
  final: 'After final round',
}

const GOAL_LABELS: Record<string, string> = {
  feedback: 'Ask for feedback',
  future: 'Keep door open for future',
  both: 'Both',
}

const SYSTEM = `Write a graceful rejection reply email for a candidate. Rules: no bitterness, no begging for reconsideration, thank them genuinely, if asking for feedback — frame it as wanting to improve not to dispute the decision, close door warmly. Under 80 words.

Format:
Subject: ...
---
[email body]`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('rejection')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { company, role, stage = 'screening', goal = 'both' } = body as {
      company?: string
      role?: string
      stage?: string
      goal?: string
    }

    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Company and role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `Company: ${company.trim()}
Role: ${role.trim()}
Stage: ${STAGE_LABELS[stage] ?? stage}
Goals: ${GOAL_LABELS[goal] ?? goal}`,
    })

    await finishToolUse(auth.user.id, 'rejection', auth.gate.isPro, {
      result: text,
      inputSummary: `${company.trim()} — ${role.trim()}`,
    })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[rejection]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
