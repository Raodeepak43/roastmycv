import { NextRequest, NextResponse } from 'next/server'
import type { Intensity } from '@/app/api/roast/prompts'
import { hasRoastLlmKey } from '@/lib/roast/complete'
import { generateLinkedInRoast } from '@/lib/linkedin-roast/generate'
import { fetchLinkedInProfileText, LinkedInFetchError } from '@/lib/linkedin-roast/fetch-profile'
import { isLiLimitReached, readGuestSession, attachGuestSession, incrementLi, liUsesLeft } from '@/lib/guest-session'
import { LINKEDIN_FREE_LIMIT } from '@/lib/linkedin-usage'
import { isFingerprintPaid } from '@/lib/usage'
import { incrementStatsCount } from '@/lib/stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (!hasRoastLlmKey()) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    let body: { profileText?: string; profileUrl?: string; intensity?: string; language?: string; fp?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { profileText: rawProfileText, profileUrl, intensity = 'gaali_light', language = 'hinglish', fp } = body

    const paid = fp && typeof fp === 'string' ? await isFingerprintPaid(fp) : false
    const session = readGuestSession(req)
    if (!paid && isLiLimitReached(session, paid, LINKEDIN_FREE_LIMIT)) {
      return NextResponse.json({ error: 'Free limit reached' }, { status: 429 })
    }

    let profileText = typeof rawProfileText === 'string' ? rawProfileText.trim() : ''

    if (!profileText && profileUrl && typeof profileUrl === 'string' && profileUrl.trim()) {
      try {
        profileText = await fetchLinkedInProfileText(profileUrl.trim())
      } catch (err) {
        if (err instanceof LinkedInFetchError) {
          return NextResponse.json({ error: err.message }, { status: 422 })
        }
        return NextResponse.json(
          { error: 'Could not load profile — paste your profile text instead.' },
          { status: 422 },
        )
      }
    }

    if (!profileText || profileText.length < 80) {
      return NextResponse.json(
        { error: 'Paste more of your LinkedIn profile (min 80 chars) or provide a valid profile URL' },
        { status: 400 },
      )
    }

    const level = (['clean', 'gaali_light', 'savage'].includes(intensity) ? intensity : 'gaali_light') as Intensity
    const result = await generateLinkedInRoast(profileText, level, language)

    const statsCount = await incrementStatsCount()
    const nextSession = incrementLi(session)
    const usesLeft = liUsesLeft(nextSession, paid, LINKEDIN_FREE_LIMIT)

    const res = NextResponse.json({
      ...result,
      language,
      intensity: level,
      statsCount,
      usesLeft,
      used: nextSession.li,
      paid,
    })
    attachGuestSession(res, nextSession)
    return res
  } catch (err) {
    console.error('[linkedin-roast]', err)
    return NextResponse.json({ error: 'Kuch gadbad ho gayi, dobara try karo' }, { status: 500 })
  }
}
