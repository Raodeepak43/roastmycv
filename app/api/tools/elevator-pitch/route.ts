import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { finishToolUse, requireToolUser, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CONTEXT_LABELS: Record<string, string> = {
  interview: 'Job interview',
  networking: 'Networking event',
  linkedin: 'LinkedIn voice note',
  campus: 'Campus placement',
}

const SYSTEM = `Write elevator pitches for a job candidate. Provide TWO versions separated by ---VERSION---:
Version 1: 30-second pitch (75-90 words exactly). Structure: who you are (1 line) → what you've done that's relevant (1-2 achievements with impact) → why this role/company specifically (1 line) → confident close. Mark natural pause points with [pause]. Use **bold** for emphasis words.
Version 2: 60-second version for networking (130-150 words), same structure.

Add a ## Delivery tips section with 3 bullet points after both versions.
No buzzwords. Must sound spoken, not read.`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('elevator-pitch')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, targetRole, context = 'interview', language = 'english' } = body as {
      cv?: string
      targetRole?: string
      context?: string
      language?: string
    }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }
    if (!targetRole?.trim()) {
      return NextResponse.json({ error: 'Target role required' }, { status: 400 })
    }

    const langLabel = language === 'hinglish' ? 'Hinglish' : 'English'

    const text = await completeToolText({
      system: SYSTEM,
      user: `Context: ${CONTEXT_LABELS[context] ?? context}
Target role: ${targetRole.trim()}
Language/tone: ${langLabel}

CV:
${cv!.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'elevator-pitch', auth.gate.isPro, {
      result: text,
      inputSummary: targetRole.trim(),
    })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[elevator-pitch]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
