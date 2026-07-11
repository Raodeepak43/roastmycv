import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Write professional resignation letters and advice for Indian workplace context. Given name, role, company, last working day, and tone (formal/warm/burning bridges gracefully), produce: 1) The resignation letter, 2) How to handle a counter-offer conversation, 3) How to hand over work gracefully.

Format with these exact headings:
## Resignation letter
## If they make a counter-offer
## Handover checklist`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('resignation')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { name, role, company, lastDay, tone } = body as {
      name?: string
      role?: string
      company?: string
      lastDay?: string
      tone?: string
    }

    if (!name?.trim() || !company?.trim()) {
      return NextResponse.json({ error: 'Name and company required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `NAME: ${name.trim()}\nROLE: ${role?.trim() || 'Not specified'}\nCOMPANY: ${company.trim()}\nLAST WORKING DAY: ${lastDay?.trim() || '2 weeks notice'}\nTONE: ${tone?.trim() || 'formal'}`,
    })

    await finishToolUse(auth.user.id, 'resignation', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[resignation]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
