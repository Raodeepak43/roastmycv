import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Write a cold outreach email from a job candidate to a recruiter. Rules: max 150 words, specific subject line (not 'Job Application'), open with ONE specific reason why you're interested in this company (not generic), highlight ONE achievement from the CV in one sentence with a number, clear ask in closing (15-min call), no attachments mentioned, no 'I hope this email finds you well'. Sound human not robotic. If recruiter name unknown use 'Hi [Name]'.

Format:
Subject: ...
---
[email body]`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('cold-email')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, role, company, recruiterName } = body as {
      cv?: string
      role?: string
      company?: string
      recruiterName?: string
    }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }
    if (!role?.trim() || !company?.trim()) {
      return NextResponse.json({ error: 'Role and company required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `Target role: ${role.trim()}\nCompany: ${company.trim()}\nRecruiter: ${recruiterName?.trim() || 'Unknown'}\n\nCV:\n${cv!.trim()}`,
    })

    await finishToolUse(auth.user.id, 'cold-email', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[cold-email]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
