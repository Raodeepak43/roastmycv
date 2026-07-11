import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `You write freelancer profiles for Indian professionals targeting global clients. From a CV, top skill, and target clients, produce three outputs tailored for Indian freelancers (Hinglish-friendly tone where appropriate):

Format with these exact headings:
## Upwork profile overview
## Fiverr gig (title + description)
## Toptal-style professional summary`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('freelancer-profile')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, topSkill, targetClients } = body as { cv?: string; topSkill?: string; targetClients?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }
    if (!topSkill?.trim()) {
      return NextResponse.json({ error: 'Top skill required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `TOP SKILL: ${topSkill.trim()}\nTARGET CLIENTS: ${targetClients?.trim() || 'Global SMBs'}\n\nCV:\n${cv!.trim()}`,
      maxTokens: 4096,
    })

    await finishToolUse(auth.user.id, 'freelancer-profile', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[freelancer-profile]', err)
    return NextResponse.json({ error: 'Profile generation failed' }, { status: 500 })
  }
}
