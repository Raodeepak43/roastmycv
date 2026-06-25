import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  INTENSITY_PROMPTS,
  getRoastModel,
  RESUME_CHAR_LIMIT,
  type Intensity,
} from './prompts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key missing — .env.local check karo' }, { status: 500 })
    }

    let body: { resumeText?: string; intensity?: string }
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { resumeText, intensity = 'gaali_light' } = body

    if (!resumeText || typeof resumeText !== 'string') {
      return Response.json({ error: 'Resume text required' }, { status: 400 })
    }

    if (resumeText.trim().length < 50) {
      return Response.json({ error: 'Resume text too short' }, { status: 400 })
    }

    const level = (['clean', 'gaali_light', 'savage'].includes(intensity) ? intensity : 'gaali_light') as Intensity
    const trimmed = resumeText.slice(0, RESUME_CHAR_LIMIT)
    const model = getRoastModel(level)
    const userPrompt =
      level === 'clean'
        ? `Roast this resume. Reference actual lines from it:\n\n${trimmed}`
        : `Roast this resume with gaali as per intensity level. Reference actual lines from it:\n\n${trimmed}`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = client.messages.stream({
            model,
            max_tokens: 500,
            system: INTENSITY_PROMPTS[level],
            messages: [{ role: 'user', content: userPrompt }],
          })

          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('Stream error:', err)
          const msg = err instanceof Error ? err.message : 'Roast failed'
          controller.enqueue(encoder.encode(`\nERROR: ${msg}`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Roast-Model': model,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Kuch gadbad ho gayi, dobara try karo' }, { status: 500 })
  }
}
