import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `You are an interview prep coach. Given a company name, role, and interview date, produce a concise 5-minute research brief. Cover: company overview (what they do, size, market), recent news or product focus (use general knowledge — note if uncertain), culture signals, talking points to impress, 5 smart questions to ask the interviewer, and red flags to probe. Be practical and specific to the role.

Format with these exact headings:
## Company overview
## Recent focus & culture
## Talking points to mention
## 5 smart questions to ask
## Red flags to probe`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('company-research')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { company, role, interviewDate } = body as { company?: string; role?: string; interviewDate?: string }

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 })
    }
    if (!role?.trim()) {
      return NextResponse.json({ error: 'Role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `COMPANY: ${company.trim()}\nROLE: ${role.trim()}\nINTERVIEW DATE: ${interviewDate?.trim() || 'Not specified'}`,
    })

    await finishToolUse(auth.user.id, 'company-research', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[company-research]', err)
    return NextResponse.json({ error: 'Research failed' }, { status: 500 })
  }
}
