import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { finishToolUse, requireToolUser } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITUATION_LABELS: Record<string, string> = {
  interview: 'After interview — no result yet',
  applied: 'After applying — no interview invite',
  cold: 'After sending cold email — no reply',
}

const SYSTEM = `Write 3 follow-up emails for a job candidate who has not heard back. Version 1: gentle check-in, Version 2: direct and confident, Version 3: polite final nudge that signals you may move on. Each under 100 words. Non-desperate, non-annoying. Subject lines must not start with 'Following up on'.

Separate each version with ---VERSION---
Label each: ## Gentle / ## Direct / ## Final nudge
Each version must include Subject: and email body.`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('follow-up')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { situation = 'applied', daysSince = 7, contactName, company, role } = body as {
      situation?: string
      daysSince?: number
      contactName?: string
      company?: string
      role?: string
    }

    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Company and role required' }, { status: 400 })
    }

    const sitLabel = SITUATION_LABELS[situation] ?? situation

    const text = await completeToolText({
      system: SYSTEM,
      user: `Situation: ${sitLabel}
Days since last contact: ${daysSince}
Contact name: ${contactName?.trim() || 'Not specified'}
Company: ${company.trim()}
Role: ${role.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'follow-up', auth.gate.isPro, {
      result: text,
      inputSummary: `${company.trim()} — ${role.trim()}`,
    })
    return NextResponse.json({ result: text, minDays: situation === 'interview' ? 7 : situation === 'applied' ? 10 : 5 })
  } catch (err) {
    console.error('[follow-up]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
