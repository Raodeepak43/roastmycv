import { NextRequest } from 'next/server'
import { streamToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort, trimCvForTool } from '@/lib/tools/dashboard/route-utils'
import { HAIKU_MODEL } from '@/lib/tools/dashboard/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `You are an expert interview coach. Based on the candidate's CV and target role, generate 8-10 interview questions they are LIKELY to be asked. Focus on: gaps in their CV, career transitions, specific achievements, and standard role-specific questions. For each question provide: why the interviewer asks it, and a specific answer framework using the candidate's actual CV content. Group by: Behavioural, Technical, CV-specific, Situational.

For each question use this format:
### [Category] Question text
**Why they ask this:** ...
**How to answer:**
- ...
**Sample answer framework (STAR):**
...`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('interview-prep')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, jobTitle, company, types } = body as {
      cv?: string
      jobTitle?: string
      company?: string
      types?: string[]
    }

    if (cvTooShort(cv)) {
      return new Response(JSON.stringify({ error: 'CV text too short' }), { status: 400 })
    }
    if (!jobTitle?.trim()) {
      return new Response(JSON.stringify({ error: 'Job title required' }), { status: 400 })
    }

    const typeList =
      Array.isArray(types) && types.length ? types.join(', ') : 'Behavioural, Technical, CV-specific, Situational'

    const cvText = trimCvForTool(cv!.trim())
    const role = jobTitle.trim()
    const companyName = company?.trim() || 'Not specified'

    return streamToolText({
      system: SYSTEM,
      user: `Role: ${role}\nCompany: ${companyName}\nQuestion types to include: ${typeList}\n\nCV:\n${cvText}`,
      model: HAIKU_MODEL,
      maxTokens: 4096,
      onComplete: async (fullText) => {
        await finishToolUse(auth.user.id, 'interview-prep', auth.gate.isPro, {
          result: fullText,
          inputSummary: role,
        })
      },
    })
  } catch (err) {
    console.error('[interview-prep]', err)
    return new Response(JSON.stringify({ error: 'Generation failed' }), { status: 500 })
  }
}
