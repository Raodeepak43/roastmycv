import Anthropic from '@anthropic-ai/sdk'
import { HAIKU_MODEL, SONNET_MODEL } from '@/lib/tools/dashboard/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim())
}

export async function completeToolText(params: {
  system: string
  user: string
  model?: string
  maxTokens?: number
}): Promise<string> {
  if (!hasAnthropicKey()) throw new Error('AI service unavailable')

  const message = await anthropic.messages.create({
    model: params.model ?? HAIKU_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: 'user', content: params.user }],
  })

  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

export function streamToolText(params: {
  system: string
  user: string
  model?: string
  maxTokens?: number
  onComplete?: (fullText: string) => void | Promise<void>
}): Response {
  return streamToolConversation({
    system: params.system,
    messages: [{ role: 'user', content: params.user }],
    model: params.model,
    maxTokens: params.maxTokens,
    onComplete: params.onComplete,
  })
}

export function streamToolConversation(params: {
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  model?: string
  maxTokens?: number
  onComplete?: (fullText: string) => void | Promise<void>
}): Response {
  if (!hasAnthropicKey()) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  let fullText = ''
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = anthropic.messages.stream({
          model: params.model ?? HAIKU_MODEL,
          max_tokens: params.maxTokens ?? 4096,
          system: params.system,
          messages: params.messages,
        })

        for await (const event of aiStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
        if (params.onComplete && fullText.trim()) {
          await params.onComplete(fullText)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AI request failed'
        console.error('[streamToolConversation]', message, err)
        controller.enqueue(encoder.encode(`\n\n⚠️ ${message}`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  })
}

export function parseJsonFromLlm<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Invalid JSON response from AI')
  return JSON.parse(match[0]) as T
}

export { HAIKU_MODEL, SONNET_MODEL }
