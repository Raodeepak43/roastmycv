import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import {
  createRoastId,
  getUserUsage,
  incrementUserRoasts,
  saveUserRoast,
} from '@/lib/dashboard/user-data'
import { generateRoast } from '@/lib/roast/generate'
import { saveDashboardCv } from '@/lib/tools/dashboard/cv'
import { incrementStatsCount } from '@/lib/stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in to roast from your dashboard' }, { status: 401 })
    }

    const usage = await getUserUsage(user.id)
    if (usage.plan !== 'pro' && usage.roastsLeft <= 0) {
      return NextResponse.json({ error: 'Free roast limit reached' }, { status: 429 })
    }

    let body: { resumeText?: string; intensity?: string; language?: string; fileName?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { resumeText, intensity = 'gaali_light', language = 'hinglish', fileName } = body

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Resume text too short' }, { status: 400 })
    }

    const roast = await generateRoast(resumeText, intensity, language)
    const id = createRoastId()
    const trimmedText = resumeText.trim()

    const saved = await saveUserRoast(user.id, id, {
      score: roast.score,
      title: roast.title,
      verdict: roast.verdict,
      intensity: roast.intensity,
      language: roast.language,
      fileName,
      lines: roast.lines,
      fixes: roast.fixes,
      resumeText: trimmedText,
    })

    if (saved) {
      await incrementUserRoasts(user.id)
      void saveDashboardCv(user.id, trimmedText, { fileName: fileName ?? null, source: 'roast' })
    } else {
      console.warn('[dashboard/roast] DB save failed — client sessionStorage fallback will be used')
    }

    const statsCount = await incrementStatsCount()
    const updatedUsage = await getUserUsage(user.id)

    return NextResponse.json({
      id,
      saved: Boolean(saved),
      score: roast.score,
      title: roast.title,
      lines: roast.lines,
      verdict: roast.verdict,
      fixes: roast.fixes,
      intensity: roast.intensity,
      language: roast.language,
      statsCount,
      usage: updatedUsage,
    })
  } catch (err) {
    console.error('[dashboard/roast]', err)
    return NextResponse.json({ error: 'Roast failed — try again' }, { status: 500 })
  }
}
