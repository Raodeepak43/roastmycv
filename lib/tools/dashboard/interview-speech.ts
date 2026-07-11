export type SpeakInterviewOptions = {
  voiceId?: string
  /** Audio fetched and ready — reveal synced text here. */
  onStart?: () => void
  onEnd?: () => void
  /** ElevenLabs failed — using browser voice instead. */
  onFallback?: (reason: string) => void
}

export type SpeakInterviewResult = 'elevenlabs' | 'browser' | 'none' | 'cancelled' | 'blocked'

let activeInterviewAudio: HTMLAudioElement | null = null
let activeSpeechAbort: AbortController | null = null
let interviewAudioUnlocked = false

/** Call on user gesture (Start / Record) so async TTS can play after fetch. */
export function unlockInterviewAudio() {
  if (interviewAudioUnlocked || typeof window === 'undefined') return
  interviewAudioUnlocked = true
  try {
    const silent = new Audio(
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    )
    silent.volume = 0.001
    void silent.play().catch(() => {})
  } catch {
    /* ignore */
  }
}

/** Stop any in-flight TTS fetch and currently playing interview audio. */
export function stopInterviewSpeech() {
  if (activeSpeechAbort) {
    activeSpeechAbort.abort()
    activeSpeechAbort = null
  }

  if (activeInterviewAudio) {
    try {
      activeInterviewAudio.pause()
      activeInterviewAudio.removeAttribute('src')
      activeInterviewAudio.load()
    } catch {
      /* ignore */
    }
    activeInterviewAudio = null
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

async function speakWithBrowserTts(
  text: string,
  opts?: SpeakInterviewOptions,
  cancelled?: () => boolean,
): Promise<SpeakInterviewResult> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return 'none'

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    utterance.rate = 0.94
    utterance.pitch = 1

    utterance.onstart = () => {
      if (cancelled?.()) {
        window.speechSynthesis.cancel()
        resolve('cancelled')
        return
      }
      opts?.onStart?.()
    }

    utterance.onend = () => {
      if (cancelled?.()) resolve('cancelled')
      else {
        opts?.onEnd?.()
        resolve('browser')
      }
    }

    utterance.onerror = () => {
      opts?.onEnd?.()
      resolve('none')
    }

    window.speechSynthesis.speak(utterance)
  })
}

/** ElevenLabs TTS — returns MP3 bytes. */
export async function speakInterviewText(
  raw: string,
  opts?: SpeakInterviewOptions,
): Promise<SpeakInterviewResult> {
  const speechText = raw.includes('INTERVIEW_COMPLETE')
    ? extractInterviewClosingSpeech(raw)
    : extractInterviewSpeechText(raw)
  if (!speechText) return 'none'

  stopInterviewSpeech()

  const abort = new AbortController()
  activeSpeechAbort = abort

  const cancelled = () => abort.signal.aborted

  try {
    const res = await fetch('/api/tools/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: speechText, voiceId: opts?.voiceId }),
      signal: abort.signal,
    })

    if (cancelled()) return 'cancelled'

    if (res.ok && res.headers.get('content-type')?.includes('audio')) {
      const blob = await res.blob()
      if (cancelled()) return 'cancelled'

      const url = URL.createObjectURL(blob)

      return await new Promise<SpeakInterviewResult>((resolve) => {
        const audio = new Audio(url)
        activeInterviewAudio = audio

        const release = () => {
          URL.revokeObjectURL(url)
          if (activeInterviewAudio === audio) activeInterviewAudio = null
        }

        const fallback = () => {
          release()
          if (cancelled()) resolve('cancelled')
          else resolve('none')
        }

        audio.onplaying = () => {
          if (cancelled()) {
            audio.pause()
            release()
            resolve('cancelled')
            return
          }
          opts?.onStart?.()
        }

        audio.onended = () => {
          release()
          if (cancelled()) {
            resolve('cancelled')
            return
          }
          opts?.onEnd?.()
          resolve('elevenlabs')
        }

        audio.onerror = () => fallback()

        void audio.play().catch((err) => {
          if (cancelled()) {
            release()
            resolve('cancelled')
          } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
            release()
            resolve('blocked')
          } else {
            fallback()
          }
        })
      })
    }

    if (!cancelled()) {
      const errBody = (await res.json().catch(() => null)) as { error?: string; fallback?: string } | null
      const reason = errBody?.error || `Speech API error (${res.status})`
      console.warn('[interview-speech] TTS API failed', res.status, errBody)
      opts?.onFallback?.(reason)
      return speakWithBrowserTts(speechText, opts, cancelled)
    }
  } catch (err) {
    if (cancelled()) return 'cancelled'
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    console.warn('[interview-speech] TTS fetch failed', err)
    const reason = err instanceof Error ? err.message : 'Speech request failed'
    opts?.onFallback?.(reason)
  } finally {
    if (activeSpeechAbort === abort) activeSpeechAbort = null
  }

  if (cancelled()) return 'cancelled'

  return speakWithBrowserTts(speechText, opts, cancelled)
}

/** Spoken closing line before INTERVIEW_COMPLETE (not the JSON block). */
export function extractInterviewClosingSpeech(raw: string): string {
  const beforeComplete = raw.split(/INTERVIEW_COMPLETE/i)[0]?.trim() ?? ''
  const cleaned = stripInterviewMarkdown(beforeComplete)
  if (cleaned) return cleaned.slice(0, 800)
  return extractInterviewSpeechText(raw)
}

/** Strip markdown / noise for TTS and cleaner interview display. */

export function stripInterviewMarkdown(text: string): string {
  return text
    .replace(/INTERVIEW_COMPLETE[\s\S]*/i, '')
    .replace(/ANSWER_FEEDBACK:[\s\S]*/i, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/\[(?:pause|PAUSE)\]/gi, '...')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Prefer the actual interview question (often after --- or last bold block). */
export function extractInterviewSpeechText(raw: string): string {
  const cleaned = stripInterviewMarkdown(raw)
  if (!cleaned) return ''

  const parts = cleaned.split(/\n---+\n/)
  const tail = parts[parts.length - 1]?.trim() ?? cleaned

  if (!tail.includes('?')) {
    return tail.slice(0, 1200)
  }

  const lines = tail.split('\n').map((l) => l.trim()).filter(Boolean)
  const questionLine = [...lines].reverse().find((l) => l.includes('?')) ?? lines[lines.length - 1]

  if (questionLine && questionLine.length >= 20) {
    const intro = lines.length > 1 ? lines.slice(0, -1).join(' ') : ''
    return intro ? `${intro} ${questionLine}` : questionLine
  }

  return tail.slice(0, 1200)
}

export function formatInterviewDisplay(raw: string): string {
  return stripInterviewMarkdown(raw)
}
