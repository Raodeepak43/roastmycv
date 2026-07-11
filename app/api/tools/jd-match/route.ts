import { NextRequest } from 'next/server'
import { streamToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'
import { HAIKU_MODEL } from '@/lib/tools/dashboard/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `You are an expert ATS resume analyser. You will be given a CV and a job description. Analyse the match and respond with: 1) An ATS match score out of 100, 2) Missing keywords from the JD not in the CV, 3) Keywords present in both, 4) Specific bullet point rewrites to add missing keywords naturally, 5) Irrelevant content to remove. Be specific and actionable. Format with clear headings.

Use these exact headings:
## ATS Match Score
## Keywords you're missing
## Keywords you have
## What to add to your CV
## What to cut`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('jd-match')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, jobDescription } = body as { cv?: string; jobDescription?: string }

    if (cvTooShort(cv)) {
      return new Response(JSON.stringify({ error: 'CV text too short' }), { status: 400 })
    }
    if (!jobDescription?.trim() || jobDescription.trim().length < 30) {
      return new Response(JSON.stringify({ error: 'Job description too short' }), { status: 400 })
    }

    const jd = jobDescription.trim()

    return streamToolText({
      system: SYSTEM,
      user: `CV:\n${cv!.trim()}\n\n---\n\nJOB DESCRIPTION:\n${jd}`,
      model: HAIKU_MODEL,
      maxTokens: 4096,
      onComplete: async (fullText) => {
        await finishToolUse(auth.user.id, 'jd-match', auth.gate.isPro, {
          result: fullText,
          inputSummary: jd.slice(0, 120),
        })
      },
    })
  } catch (err) {
    console.error('[jd-match]', err)
    return new Response(JSON.stringify({ error: 'Analysis failed' }), { status: 500 })
  }
}
