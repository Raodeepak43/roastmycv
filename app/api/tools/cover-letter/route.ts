import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LENGTH_WORDS: Record<string, number> = {
  short: 150,
  standard: 300,
  full: 500,
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('cover-letter')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, jobDescription, company, tone = 'professional', length = 'standard' } = body as {
      cv?: string
      jobDescription?: string
      company?: string
      tone?: string
      length?: string
    }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description required' }, { status: 400 })
    }

    const wordTarget = LENGTH_WORDS[length] ?? 300
    const toneLabel =
      tone === 'hinglish' ? 'Hinglish (India)' : tone === 'conversational' ? 'Conversational' : 'Professional'

    const SYSTEM = `You are an expert cover letter writer. Write a cover letter (~${wordTarget} words) for the job description provided, tailored to the candidate's CV. Tone: ${toneLabel}. Rules: no generic openers like 'I am writing to apply', reference specific things from the JD, highlight 2-3 CV achievements that directly match the role, end with a confident call to action. If company name is provided, reference it naturally. Do not make up information not in the CV. Use proper formatting with Dear [Hiring Manager], paragraphs, and sign-off.`

    const text = await completeToolText({
      system: SYSTEM,
      user: `Company: ${company?.trim() || 'Not specified'}\n\nCV:\n${cv!.trim()}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'cover-letter', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[cover-letter]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
