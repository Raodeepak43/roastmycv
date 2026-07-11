import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SYSTEM = `You are a career development coach. Analyse the gap between a candidate's current skills (from their CV) and what's needed for their target role. Provide: 1) Skills they already have that are relevant, 2) Missing skills ordered by how frequently employers require them, 3) A specific learning plan for the top 3 gaps with real, named free resources (Coursera course names, YouTube channels, NPTEL courses — be specific, not generic). Be practical and encouraging.

Format with these exact headings:
## Skills you already have
## Skills you're missing
## Your learning plan`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('skills-gap')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, targetRole } = body as { cv?: string; targetRole?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short (min 50 chars)' }, { status: 400 })
    }
    if (!targetRole?.trim()) {
      return NextResponse.json({ error: 'Target role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `TARGET ROLE: ${targetRole.trim()}\n\nCV:\n${cv!.trim()}`,
    })

    await finishToolUse(auth.user.id, 'skills-gap', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[skills-gap]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
