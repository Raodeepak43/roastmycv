import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { elevenLabsTextToSpeech, isElevenLabsConfigured } from '@/lib/elevenlabs-tts'
import { isInterviewVoiceId } from '@/lib/tools/dashboard/interview-voices'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    let body: { text?: string; voiceId?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (text.length < 2) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 })
    }

    if (!isElevenLabsConfigured()) {
      return NextResponse.json({ error: 'Speech engine not configured', fallback: 'browser' }, { status: 503 })
    }

    const audio = await elevenLabsTextToSpeech({
      text,
      voiceId:
        typeof body.voiceId === 'string' && isInterviewVoiceId(body.voiceId) ? body.voiceId : undefined,
    })

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[tools/speech]', err)
    return NextResponse.json({ error: 'Speech unavailable', fallback: 'browser' }, { status: 502 })
  }
}
