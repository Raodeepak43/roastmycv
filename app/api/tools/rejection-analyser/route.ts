import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `You are an ATS and recruiter expert. Analyse this candidate's CV against multiple job descriptions they applied to and presumably were rejected from. Find the CONSISTENT PATTERN of what's missing across all JDs. Be specific: name exact skills, keywords, experience types that appear in multiple JDs but are absent or weak in the CV. Give one primary root cause, then quick fixes. This is about patterns, not individual JD matching.

Format with these exact headings:
## The Pattern
## What's missing in every JD you applied to
## You keep applying for roles that need X but your CV shows Y
## Fix this first
## Quick wins`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('rejection-analyser')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, jobDescriptions } = body as { cv?: string; jobDescriptions?: string[] }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }

    const jds = (jobDescriptions ?? []).map((j) => j?.trim()).filter((j) => j && j.length >= 50)
    if (jds.length < 3) {
      return NextResponse.json({ error: 'Paste at least 3 job descriptions (min 50 chars each)' }, { status: 400 })
    }

    const jdBlock = jds.map((jd, i) => `--- JOB DESCRIPTION ${i + 1} ---\n${jd}`).join('\n\n')

    const text = await completeToolText({
      system: SYSTEM,
      user: `CV:\n${cv!.trim()}\n\n${jdBlock}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'rejection-analyser', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[rejection-analyser]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
