import type { MockInterviewComplete } from '@/components/dashboard/interview/types'

/** Parse INTERVIEW_COMPLETE + JSON from model output. */
export function parseMockInterviewComplete(text: string): MockInterviewComplete | null {
  const idx = text.indexOf('INTERVIEW_COMPLETE')
  if (idx === -1) return null

  const jsonPart = text.slice(idx + 'INTERVIEW_COMPLETE'.length).trim()
  const match = jsonPart.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0]) as MockInterviewComplete
  } catch {
    // Try trimming to last balanced brace (truncated stream)
    const raw = match[0]
    let depth = 0
    let end = -1
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === '{') depth++
      if (raw[i] === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end > 0) {
      try {
        return JSON.parse(raw.slice(0, end + 1)) as MockInterviewComplete
      } catch {
        return null
      }
    }
    return null
  }
}

export function countInterviewUserAnswers(messages: { role: string }[]): number {
  return messages.filter((m) => m.role === 'user').length
}

export function countInterviewAssistantTurns(messages: { role: string; content?: string }[]): number {
  return messages.filter(
    (m) => m.role === 'assistant' && !(m.content ?? '').includes('INTERVIEW_COMPLETE'),
  ).length
}

export function isInterviewReadyToScore(
  messages: { role: string }[],
  totalQuestions: number,
): boolean {
  return countInterviewUserAnswers(messages) >= totalQuestions
}

export function closingSpeechBeforeComplete(text: string): string {
  const idx = text.indexOf('INTERVIEW_COMPLETE')
  const spoken = idx === -1 ? text : text.slice(0, idx)
  return spoken.trim()
}
