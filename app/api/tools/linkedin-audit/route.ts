import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, SONNET_MODEL } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM = `Audit this LinkedIn profile for someone targeting the specified role. Score each section out of its maximum. Be brutally honest like a recruiter who looks at 100 profiles a day.

Start with:
## Overall Score
X / 100

Then these sections:
## Headline (X/20)
Issue: ...
Rewrite: ...

## About section (X/20)
Issue: ...
Rewrite: ...

## Experience bullets (X/20)
Top 3 issues + example rewrites

## Skills section (X/15)
Missing skills to add

## Featured section (X/10)
What to put here

## Photo/banner (X/10)
Tips only

## Activity/posts (X/5)
Posting frequency tip`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('linkedin-audit')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { profileText, targetRole } = body as { profileText?: string; targetRole?: string }

    if (!profileText?.trim() || profileText.trim().length < 100) {
      return NextResponse.json({ error: 'Paste your full LinkedIn profile (min 100 chars)' }, { status: 400 })
    }
    if (!targetRole?.trim()) {
      return NextResponse.json({ error: 'Target role required' }, { status: 400 })
    }

    const text = await completeToolText({
      system: SYSTEM,
      user: `Target role: ${targetRole.trim()}\n\nLinkedIn profile:\n${profileText.trim().slice(0, 12000)}`,
      model: SONNET_MODEL,
      maxTokens: 6000,
    })

    await finishToolUse(auth.user.id, 'linkedin-audit', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[linkedin-audit]', err)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
