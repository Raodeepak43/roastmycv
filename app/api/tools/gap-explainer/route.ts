import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `Help a job candidate explain a career gap honestly but positively. Do NOT make up skills or activities they didn't mention. Do NOT be sycophantic. Write 3 versions: 1) A 1-line CV entry for the gap period, 2) A confident 3-4 sentence interview answer that briefly acknowledges the gap and pivots to readiness now, 3) An optional cover letter sentence. Rules: honest, not defensive, forward-looking, no oversharing.

Format with these exact headings:
## For your CV
## For the interview
## For the cover letter
## Which version to use`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('gap-explainer')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { duration, reason, targetRole } = body as {
      duration?: string
      reason?: string
      targetRole?: string
    }

    if (!duration?.trim() || !targetRole?.trim()) {
      return NextResponse.json({ error: 'Duration and target role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `Gap duration: ${duration.trim()}\nWhat they were doing: ${reason?.trim() || 'Not specified'}\nTarget role: ${targetRole.trim()}`,
    })

    await finishToolUse(auth.user.id, 'gap-explainer', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[gap-explainer]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
