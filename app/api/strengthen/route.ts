import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const prompts: Record<string, (text: string) => string> = {
  bullet: (text) => `Rewrite this resume bullet in STAR format for a competitive tech role.
Rules:
- Start with strong verb: Led/Owned/Drove/Built/Scaled/Reduced/Increased
- Add specific numbers (estimate reasonably if missing)
- Show impact and scale
- Max 1 line, under 20 words
- No AI buzzwords (no leverage/utilize/synergy)
- Return ONLY the rewritten bullet, nothing else

Bullet: "${text}"`,

  summary: (text) => `Rewrite this professional summary for a strong tech job application.
Rules:
- 2-3 sentences max
- Mention years of experience
- Include scale (users, revenue, team size)
- Use ownership language
- No AI buzzwords
- Return ONLY the rewritten summary

Summary: "${text}"`,

  project: (text) => `Rewrite this project description for a tech resume.
Rules:
- One sentence, show impact
- Mention tech stack naturally
- Add numbers if possible
- Return ONLY the description

Description: "${text}"`,
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    let body: { text?: string; type?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const text = typeof body.text === 'string' ? body.text.trim() : ''
    const type = typeof body.type === 'string' ? body.type : 'bullet'

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    const promptFn = prompts[type] ?? prompts.bullet

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: promptFn(text) }],
    })

    const block = message.content[0]
    const result = block.type === 'text' ? block.text.trim() : ''

    return NextResponse.json({ result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Strengthen failed' }, { status: 500 })
  }
}
