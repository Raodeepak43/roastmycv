import { DEFAULT_INTERVIEW_VOICE_ID } from '@/lib/tools/dashboard/interview-voices'

const ELEVENLABS_TTS_BASE = 'https://api.elevenlabs.io/v1/text-to-speech'

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim())
}

function elevenLabsKey(): string {
  return process.env.ELEVENLABS_API_KEY?.trim() || ''
}

/** Default: George — calm British interviewer (override via ELEVENLABS_VOICE_ID). */
export function getElevenLabsVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_INTERVIEW_VOICE_ID
}

export function getElevenLabsModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_flash_v2_5'
}

export type ElevenLabsTtsOptions = {
  text: string
  voiceId?: string
  modelId?: string
}

/** ElevenLabs TTS — returns MP3 bytes. */
export async function elevenLabsTextToSpeech(opts: ElevenLabsTtsOptions): Promise<Buffer> {
  const key = elevenLabsKey()
  if (!key) throw new Error('Speech engine not configured')

  const text = opts.text.trim().slice(0, 5000)
  if (text.length < 2) throw new Error('Text too short for speech')

  const voiceId = opts.voiceId ?? getElevenLabsVoiceId()
  const modelId = opts.modelId ?? getElevenLabsModelId()

  const res = await fetch(`${ELEVENLABS_TTS_BASE}/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': key,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.62,
        similarity_boost: 0.78,
        style: 0.08,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    let message = `Speech engine error ${res.status}`
    try {
      const parsed = JSON.parse(detail) as { detail?: { message?: string; code?: string } }
      const apiMsg = parsed.detail?.message
      if (parsed.detail?.code === 'invalid_api_key' || res.status === 401) {
        message = 'Invalid speech API key'
      } else if (apiMsg) {
        message = apiMsg
      }
    } catch {
      if (detail) message = `${message}: ${detail.slice(0, 200)}`
    }
    throw new Error(message)
  }

  const arrayBuffer = await res.arrayBuffer()
  if (!arrayBuffer.byteLength) throw new Error('Speech engine returned no audio')
  return Buffer.from(arrayBuffer)
}
