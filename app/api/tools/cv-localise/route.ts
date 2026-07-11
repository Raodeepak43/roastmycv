import { NextRequest, NextResponse } from 'next/server'
import { completeToolText, SONNET_MODEL } from '@/lib/tools/dashboard/llm'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const COUNTRY_NAMES: Record<string, string> = {
  usa: 'United States',
  uk: 'United Kingdom',
  germany: 'Germany',
  canada: 'Canada',
  australia: 'Australia',
  singapore: 'Singapore',
  uae: 'United Arab Emirates',
  netherlands: 'Netherlands',
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('cv-localise')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { cv, targetCountry } = body as { cv?: string; targetCountry?: string }

    if (cvTooShort(cv)) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }
    if (!targetCountry?.trim()) {
      return NextResponse.json({ error: 'Target country required' }, { status: 400 })
    }

    const country = COUNTRY_NAMES[targetCountry] ?? targetCountry

    const SYSTEM = `You are an expert in international CV/resume standards. Localise the provided CV for the ${country} job market. Cover: 1) Format conventions (length, sections, order), 2) Content that should be removed (photos, age, nationality if inappropriate), 3) Content to add (nationality/visa status if relevant), 4) Language/spelling changes, 5) Cultural expectations. Then provide the full localised CV text. Be specific to ${country} — not generic.

Format:
## Changes to make
### Format differences
### Content to remove
### Content to add
### Language/spelling changes
### Culture-specific tips
## Your localised CV`

    const text = await completeToolText({
      system: SYSTEM,
      user: cv!.trim(),
      model: SONNET_MODEL,
      maxTokens: 6000,
    })

    await finishToolUse(auth.user.id, 'cv-localise', auth.gate.isPro, { result: text })
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[cv-localise]', err)
    return NextResponse.json({ error: 'Localisation failed' }, { status: 500 })
  }
}
