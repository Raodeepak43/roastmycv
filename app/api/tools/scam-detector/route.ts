import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, parseJsonFromLlm } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 45

const SYSTEM = `You are a job scam detector focused on India. Analyse job postings or WhatsApp job messages for scam signals: too-good salary, vague company, upfront payment requests, Telegram-only contact, work-from-home data entry traps, fake recruiter profiles, registration fees, etc. Be direct.

Return ONLY valid JSON:
{
  "verdict": "Likely scam|Suspicious|Probably legitimate",
  "confidence": "High|Medium|Low",
  "redFlags": ["..."],
  "explanation": "2-3 sentences",
  "advice": "What the candidate should do"
}`

type ScamResult = {
  verdict: string
  confidence: string
  redFlags: string[]
  explanation: string
  advice: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('scam-detector')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { posting } = body as { posting?: string }

    if (!posting?.trim() || posting.trim().length < 30) {
      return NextResponse.json({ error: 'Paste the job posting or message (min 30 chars)' }, { status: 400 })
    }

    const raw = await completeToolText({
      system: SYSTEM,
      user: posting.trim(),
      maxTokens: 1024,
    })

    const parsed = parseJsonFromLlm<ScamResult>(raw)
    await finishToolUse(auth.user.id, 'scam-detector', auth.gate.isPro, { result: parsed })
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[scam-detector]', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
