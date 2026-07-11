import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { finishToolUse, requireToolUser } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Write a post-interview thank you email. Rules: reference the specific things they discussed (do not be generic), express genuine enthusiasm for ONE specific thing about the role/company, reaffirm fit in ONE sentence, keep under 150 words, warm but professional close. Subject line should be specific, not 'Thank you for your time'.

Format:
Subject: ...
---
[email body]`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('thank-you')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { interviewerName, interviewerRole, company, discussed, yourName, tone = 'professional' } = body as {
      interviewerName?: string
      interviewerRole?: string
      company?: string
      discussed?: string
      yourName?: string
      tone?: string
    }

    if (!company?.trim() || !discussed?.trim()) {
      return NextResponse.json({ error: 'Company and discussion notes required' }, { status: 400 })
    }

    const toneLabel =
      tone === 'warm' ? 'Warm' : tone === 'brief' ? 'Brief (50 words max)' : 'Professional'

    const text = await completeToolText({
      system: SYSTEM,
      user: `Interviewer: ${interviewerName?.trim() || 'Interviewer'} (${interviewerRole?.trim() || 'role not specified'})
Company: ${company.trim()}
Discussed: ${discussed.trim()}
Your name: ${yourName?.trim() || 'Candidate'}
Tone: ${toneLabel}`,
    })

    await finishToolUse(auth.user.id, 'thank-you', auth.gate.isPro, {
      result: text,
      inputSummary: company.trim(),
    })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[thank-you]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
