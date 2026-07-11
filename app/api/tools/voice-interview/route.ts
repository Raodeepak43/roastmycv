import { NextRequest, NextResponse } from 'next/server'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'
import { SONNET_MODEL } from '@/lib/tools/dashboard/llm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const STYLE_LABELS: Record<string, string> = {
  friendly: 'Friendly HR',
  technical: 'Technical panel',
  faang: 'Tough FAANG-style',
}

const QUESTION_COUNTS: Record<string, number> = {
  short: 5,
  medium: 10,
  full: 15,
}

function buildSystem(style: string, role: string, totalQuestions: number, cv: string) {
  return `You are a ${style} interviewer for a ${role} position. You have read the candidate's CV:

${cv}

Conduct a realistic voice mock interview. Ask ONE question at a time. The candidate speaks answers (you receive transcripts). After each answer, respond with JSON on its own line prefixed ANSWER_FEEDBACK: {"content_score":1-10,"content_feedback":"...","delivery_note":"comment on filler words if provided","stronger_includes":["...","..."],"done":false}

When the candidate's transcript includes filler word stats, mention them in delivery_note.

After exactly ${totalQuestions} questions from you, output ANSWER_FEEDBACK with done:true and include interview_complete: {"overall_score":1-10,"speech_report":{"total_fillers":0,"avg_words":0,"longest_answer":"...","shortest_answer":"..."},"feedback":[{"question":"...","transcript":"...","content_score":8,"content_feedback":"...","delivery_note":"...","stronger_includes":["..."]}]}

Between questions, ask the next question naturally after the feedback JSON line. Stay in character.`
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('voice-interview')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const {
      cv,
      role,
      style = 'friendly',
      duration = 'medium',
      messages = [],
      fillerCount,
      wordCount,
      durationSec,
      stream = true,
    } = body as {
      cv?: string
      role?: string
      style?: string
      duration?: string
      messages?: { role: string; content: string }[]
      fillerCount?: number
      wordCount?: number
      durationSec?: number
      stream?: boolean
    }

    if (messages.length === 0) {
      if (cvTooShort(cv)) {
        return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
      }
      if (!role?.trim()) {
        return NextResponse.json({ error: 'Role required' }, { status: 400 })
      }
    }

    const totalQuestions = QUESTION_COUNTS[duration] ?? 10
    const styleLabel = STYLE_LABELS[style] ?? STYLE_LABELS.friendly
    const cvText = cv?.trim() ?? ''
    const system = buildSystem(styleLabel, role?.trim() ?? 'the role', totalQuestions, cvText)

    let lastUserContent = messages.filter((m) => m.role === 'user').pop()?.content ?? ''
    if (fillerCount !== undefined || wordCount !== undefined) {
      lastUserContent += `\n\n[SPOKEN ANSWER STATS: ${wordCount ?? 0} words, ${durationSec ?? 0}s, ${fillerCount ?? 0} filler words (um/uh/like/you know)]`
    }

    const anthropicMessages = messages.map((m, i) => {
      const content = m.role === 'user' && i === messages.length - 1 ? lastUserContent : m.content
      return { role: m.role as 'user' | 'assistant', content }
    })

    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Begin the voice interview with your first question only.' })
    }

    if (stream) {
      if (messages.length === 0) {
        await finishToolUse(auth.user.id, 'voice-interview', auth.gate.isPro)
      }

      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const encoder = new TextEncoder()

      const readable = new ReadableStream({
        async start(controller) {
          try {
            const aiStream = anthropic.messages.stream({
              model: SONNET_MODEL,
              max_tokens: 4096,
              system,
              messages: anthropicMessages,
            })
            for await (const event of aiStream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(event.delta.text))
              }
            }
            controller.close()
          } catch (err) {
            controller.error(err)
          }
        },
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
      })
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 4096,
      system,
      messages: anthropicMessages,
    })

    const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('')

    if (messages.length === 0) {
      await finishToolUse(auth.user.id, 'voice-interview', auth.gate.isPro)
    }

    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[voice-interview]', err)
    return NextResponse.json({ error: 'Voice interview failed' }, { status: 500 })
  }
}
