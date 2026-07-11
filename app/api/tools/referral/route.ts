import { NextRequest, NextResponse } from 'next/server'
import { completeToolText } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const RELATIONSHIP_LABELS: Record<string, string> = {
  friend: 'College friend',
  colleague: 'Ex-colleague',
  linkedin: "LinkedIn connection (don't know well)",
  senior: "Senior I've never spoken to",
}

const SYSTEM = `Write a referral request message for a job candidate. Rules: make it conversational not transactional, acknowledge it's a favour, make it easy to forward/click, don't attach CV in first message, don't guilt trip, end with an easy out ('totally fine if this isn't possible').

Also provide a ## Do's and Don'ts section with 4 bullets each.

Format depends on platform:
- WhatsApp: under 100 words, casual
- LinkedIn DM: slightly more formal, references their role
- Email: full email with Subject:`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('referral')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, company, role, relationship = 'linkedin', contactName, platform = 'linkedin' } = body as {
      cv?: string
      company?: string
      role?: string
      relationship?: string
      contactName?: string
      platform?: string
    }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }
    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Company and role required' }, { status: 400 })
    }

    const wordLimit = platform === 'whatsapp' ? 100 : platform === 'email' ? 200 : 150

    const text = await completeToolText({
      system: SYSTEM,
      user: `Target role: ${role.trim()}
Company: ${company.trim()}
Relationship: ${RELATIONSHIP_LABELS[relationship] ?? relationship}
Contact name: ${contactName?.trim() || 'Not specified'}
Platform: ${platform}
Word limit: ${wordLimit}

CV summary (for context only — do not paste full CV in message):
${cv!.trim().slice(0, 2000)}`,
    })

    await finishToolUse(auth.user.id, 'referral', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[referral]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
