/** Curated ElevenLabs voices for mock interviews (pre-made library). */
export const INTERVIEW_VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George', gender: 'male' as const, hint: 'Calm British interviewer' },
  { id: 'bIHbv24MWmeRgasZH58o', label: 'James', gender: 'male' as const, hint: 'Professional, steady tone' },
  { id: 'XrExE9yKIg1WjnnlVkGX', label: 'Matilda', gender: 'female' as const, hint: 'Warm professional' },
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah', gender: 'female' as const, hint: 'Clear & friendly' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam', gender: 'male' as const, hint: 'Confident tone' },
] as const

export type InterviewVoiceId = (typeof INTERVIEW_VOICES)[number]['id']

export const DEFAULT_INTERVIEW_VOICE_ID: InterviewVoiceId = 'JBFqnCBsd6RMkjVDRZzb'

export const INTERVIEW_VOICE_STORAGE_KEY = 'mycvroast-interview-voice'

/** Removed voice — reset saved preference if user had this selected. */
export const REMOVED_INTERVIEW_VOICE_IDS = new Set(['nPczCjzI2devNBz1zQ1K'])

export function isInterviewVoiceId(id: string): id is InterviewVoiceId {
  return INTERVIEW_VOICES.some((v) => v.id === id)
}

export function interviewVoiceLabel(id: string): string {
  return INTERVIEW_VOICES.find((v) => v.id === id)?.label ?? 'Interviewer'
}

export function interviewGreetingName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0]
  return first || 'there'
}

export function interviewVoicePreviewLine(displayName: string): string {
  return `Hello, ${interviewGreetingName(displayName)}. I'll be your interviewer today.`
}
