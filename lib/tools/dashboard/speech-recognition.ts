export type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionResultEvent = {
  results: {
    length: number
    [i: number]: {
      [j: number]: { transcript: string }
      isFinal?: boolean
    }
  }
}

export function speechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function createSpeechRecognition(lang = 'en-IN'): BrowserSpeechRecognition | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = lang
  return rec
}

export function transcriptsFromEvent(event: SpeechRecognitionResultEvent): string {
  let combined = ''
  for (let i = 0; i < event.results.length; i++) {
    combined += event.results[i][0].transcript
  }
  return combined.trim()
}
