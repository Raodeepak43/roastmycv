import { NextRequest, NextResponse } from 'next/server'
import { elevenLabsTextToSpeech, isElevenLabsConfigured } from '@/lib/elevenlabs-tts'
import { isAllowedDemoSpeech } from '@/lib/tools/marketing/demo-speech'
import { isInterviewVoiceId } from '@/lib/tools/dashboard/interview-voices'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let body: { text?: string; voiceId?: string; slug?: string; purpose?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const purpose = typeof body.purpose === 'string' ? body.purpose.trim() : ''
    const text = typeof body.text === 'string' ? body.text.trim() : ''

    if (!slug || !text || !isAllowedDemoSpeech(slug, purpose, text)) {
      return NextResponse.json({ error: 'Demo line not allowed' }, { status: 400 })
    }

    if (!isElevenLabsConfigured()) {
      return NextResponse.json({ error: 'Speech engine not configured', fallback: 'browser' }, { status: 503 })
    }

    const voiceId =
      typeof body.voiceId === 'string' && isInterviewVoiceId(body.voiceId) ? body.voiceId : undefined

    const audio = await elevenLabsTextToSpeech({ text, voiceId })

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('[demo/speech]', err)
    return NextResponse.json({ error: 'Speech unavailable', fallback: 'browser' }, { status: 502 })
  }
}
