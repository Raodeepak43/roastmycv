import { NextRequest, NextResponse } from 'next/server'
import { requireToolUser, finishToolUse, cvTooShort } from '@/lib/tools/dashboard/route-utils'
import { SONNET_MODEL, streamToolConversation } from '@/lib/tools/dashboard/llm'

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

function buildSystem(style: string, role: string, totalQuestions: number, cv: string, finalize: boolean) {
  if (finalize) {
    return `You are a ${style} interviewer wrapping up a mock interview for a ${role} position.

The candidate has answered all ${totalQuestions} questions. Do NOT ask any new questions or follow-ups.

Step 1 — Say a brief spoken closing (1-2 sentences), for example: "That wraps up our interview today — let me review your answers and share your score and feedback."

Step 2 — On a new line output exactly: INTERVIEW_COMPLETE

Step 3 — Immediately output valid JSON (no markdown fences) with this shape:
{"overall_score":1-10,"summary":"2-3 sentence overall verdict","top_mistakes":["...","..."],"improvement_tips":["...","..."],"feedback":[{"question":"...","answer_summary":"...","good":"...","weak":"...","ideal":"..."}]}

Include feedback for all ${totalQuestions} questions. Use the full conversation transcript provided.

Candidate CV for context:
${cv}`
  }

  return `You are a ${style} interviewer for a ${role} position. You have read the candidate's CV:

${cv}

Conduct a realistic job interview. Ask ONE question at a time — exactly ${totalQuestions} questions total, then stop.

Use plain text only — no markdown, no # headers, no **bold**, no bullet lists.

React naturally to brief follow-ups within the same question, but do not exceed ${totalQuestions} main questions.

After the candidate answers question ${totalQuestions}, you MUST end the interview: give a short spoken closing, then output INTERVIEW_COMPLETE on its own line, then the JSON score block:
{"overall_score":1-10,"summary":"...","top_mistakes":["..."],"improvement_tips":["..."],"feedback":[{"question":"...","answer_summary":"...","good":"...","weak":"...","ideal":"..."}]}

Stay in character until INTERVIEW_COMPLETE. Do not reveal you are AI. Speak naturally as if talking aloud.`
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireToolUser('mock-interview')
    if ('error' in auth) return auth.error

    const body = await req.json()
    const {
      cv,
      role,
      style = 'friendly',
      duration = 'medium',
      messages = [],
      stream = true,
    } = body as {
      cv?: string
      role?: string
      style?: string
      duration?: string
      messages?: { role: string; content: string }[]
      stream?: boolean
    }

    const isStart = messages.length === 0
    if (isStart) {
      if (cvTooShort(cv)) {
        return NextResponse.json({ error: 'CV text too short — upload or paste your CV first.' }, { status: 400 })
      }
      if (!role?.trim()) {
        return NextResponse.json({ error: 'Target role is required.' }, { status: 400 })
      }
    }

    const totalQuestions = QUESTION_COUNTS[duration] ?? 10
    const styleLabel = STYLE_LABELS[style] ?? STYLE_LABELS.friendly
    const cvText = cv?.trim() ?? ''

    const anthropicMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Please begin the interview with your first question.' })
    }

    const userAnswers = anthropicMessages.filter((m) => m.role === 'user').length
    const finalize = userAnswers >= totalQuestions
    const system = buildSystem(styleLabel, role?.trim() ?? 'the role', totalQuestions, cvText, finalize)

    if (!stream) {
      const { completeToolText } = await import('@/lib/tools/dashboard/llm')
      const text = await completeToolText({
        system,
        user: anthropicMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n'),
        model: SONNET_MODEL,
        maxTokens: 4096,
      })
      if (isStart) {
        await finishToolUse(auth.user.id, 'mock-interview', auth.gate.isPro)
      }
      return NextResponse.json({ result: text })
    }

    return streamToolConversation({
      system,
      messages: anthropicMessages,
      model: SONNET_MODEL,
      maxTokens: finalize ? 8192 : 4096,
      onComplete: async (fullText) => {
        if (isStart && fullText.trim() && !fullText.includes('⚠️')) {
          await finishToolUse(auth.user.id, 'mock-interview', auth.gate.isPro)
        }
      },
    })
  } catch (err) {
    console.error('[mock-interview]', err)
    const message = err instanceof Error ? err.message : 'Interview failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
