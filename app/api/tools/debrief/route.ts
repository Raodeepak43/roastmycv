import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Act as a career coach debriefing a candidate after their interview. They've described what happened. Analyse: 1) What they likely did well (find genuine positives), 2) Specific moments that probably hurt their chances based on their description, 3) Better versions of the answers they described giving, 4) Concrete preparation advice for next time. Tone: supportive coach, not harsh critic. They may be disappointed — acknowledge that briefly then focus forward.

Format with these exact headings:
## What you did well
## What likely cost you
## What you should have said
## For next time`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('debrief')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { role, company, interviewType, description, feeling } = body as {
      role?: string
      company?: string
      interviewType?: string
      description?: string
      feeling?: string
    }

    if (!description?.trim() || description.trim().length < 100) {
      return NextResponse.json({ error: 'Describe your interview in at least 100 characters' }, { status: 400 })
    }
    if (!role?.trim()) {
      return NextResponse.json({ error: 'Role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `ROLE: ${role.trim()}
COMPANY: ${company?.trim() || 'Not specified'}
INTERVIEW TYPE: ${interviewType?.trim() || 'Not specified'}
HOW THEY FELT: ${feeling?.trim() || 'Not specified'}

INTERVIEW DESCRIPTION:
${description.trim()}`,
    })

    await finishToolUse(auth.user.id, 'debrief', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[debrief]', err)
    return NextResponse.json({ error: 'Debrief failed' }, { status: 500 })
  }
}
