import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getUserUsage } from '@/lib/dashboard/user-data'
import { getLatestSavedCvText } from '@/lib/tools/dashboard/cv'
import { hasAnthropicKey, HAIKU_MODEL } from '@/lib/tools/dashboard/llm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function buildSystem(ctx: { plan: string; roastsUsed: number; roastsLimit: number; cv: string }) {
  const cvSummary = ctx.cv.slice(0, 500) || 'Not available yet — user has not saved a CV.'
  return `You are MyCVRoast AI, a friendly career assistant built into the MyCVRoast dashboard. You have access to the user's CV and account details. Be conversational, warm, and direct — like a smart friend who knows about careers, not a corporate chatbot. Keep responses concise (2-4 sentences max unless they ask for something long like a cover letter). If they ask for a tool output (cover letter, interview questions, etc.), generate it fully. You know their CV so reference it specifically.

Current user context:
Plan: ${ctx.plan}
Roasts used: ${ctx.roastsUsed}/${ctx.roastsLimit}
Their CV summary: ${cvSummary}`
}

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null
  const out: ChatMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const role = (item as { role?: string }).role
    const content = (item as { content?: string }).content
    if (role !== 'user' && role !== 'assistant') return null
    if (typeof content !== 'string' || !content.trim()) return null
    out.push({ role, content: content.trim().slice(0, 8000) })
  }
  if (out.length === 0 || out.length > 40) return null
  if (out[out.length - 1].role !== 'user') return null
  return out
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    if (!hasAnthropicKey()) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const messages = sanitizeMessages((body as { messages?: unknown }).messages)
    if (!messages) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const [usage, cv] = await Promise.all([
      getUserUsage(user.id),
      getLatestSavedCvText(user.id),
    ])

    const system = buildSystem({
      plan: usage.plan,
      roastsUsed: usage.roastsUsed,
      roastsLimit: usage.roastsLimit,
      cv: cv ?? '',
    })

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const aiStream = anthropic.messages.stream({
            model: HAIKU_MODEL,
            max_tokens: 2048,
            system,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          })
          for await (const event of aiStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('[dashboard/chat stream]', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[dashboard/chat]', err)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
