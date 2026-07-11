const SARVAM_API_BASE = 'https://api.sarvam.ai/v1'

export function isSarvamConfigured(): boolean {
  return Boolean(process.env.SARVAM_KEY?.trim() || process.env.SARVAM_API_KEY?.trim())
}

export function getSarvamModel(): string {
  return process.env.SARVAM_MODEL?.trim() || 'sarvam-30b'
}

/** OpenAI-compatible chat completions — best for Hinglish / Indic languages */
export async function sarvamChatCompletion(params: {
  system: string
  user: string
  maxTokens?: number
  model?: string
}): Promise<string> {
  const key = process.env.SARVAM_KEY?.trim() || process.env.SARVAM_API_KEY?.trim()
  if (!key) throw new Error('SARVAM_KEY missing')

  const res = await fetch(`${SARVAM_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': key,
    },
    body: JSON.stringify({
      model: params.model ?? getSarvamModel(),
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
      max_tokens: params.maxTokens ?? 2000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Sarvam API ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Sarvam returned empty response')
  return text
}
