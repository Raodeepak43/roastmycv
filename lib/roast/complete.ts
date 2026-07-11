import Anthropic from '@anthropic-ai/sdk'
import { getRoastModel, type Intensity } from '@/app/api/roast/prompts'
import { isSarvamConfigured, sarvamChatCompletion } from '@/lib/sarvam'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Languages routed to Sarvam when SARVAM_API_KEY is set (Indic-native models) */
const SARVAM_LANGUAGES = new Set(['hinglish'])

export function hasRoastLlmKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim()) || isSarvamConfigured()
}

export async function completeRoastText(params: {
  systemPrompt: string
  userMessage: string
  language: string
  intensity: Intensity
}): Promise<string> {
  const { systemPrompt, userMessage, language, intensity } = params

  if (SARVAM_LANGUAGES.has(language) && isSarvamConfigured()) {
    try {
      return await sarvamChatCompletion({ system: systemPrompt, user: userMessage })
    } catch (err) {
      console.error('[roast] Sarvam failed, falling back to Anthropic:', err)
    }
  }

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new Error('No LLM API key configured')
  }

  const message = await anthropic.messages.create({
    model: getRoastModel(intensity),
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}
