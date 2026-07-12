import type { ToolSlug } from '@/lib/tools/dashboard/config'

export type DemoSpeechPurpose = 'greeting' | 'question'

export type DemoSpeechEntry = {
  greeting: string
  question: string
}

/** Fixed lines allowed on public demo TTS — must match exactly. */
export const DEMO_SPEECH: Partial<Record<ToolSlug, DemoSpeechEntry>> = {
  'voice-interview': {
    greeting: "Hello. I'll be your interviewer today.",
    question:
      'You mentioned scaling payment APIs — walk me through the biggest production incident you handled.',
  },
  'mock-interview': {
    greeting: "Hello. I'll be your interviewer today.",
    question:
      'On your CV you led checkout optimisation — what metric moved and how did you measure it?',
  },
  'elevator-pitch': {
    greeting: "Hello. Here's how you could introduce yourself.",
    question:
      'I am a backend engineer who scaled payment APIs to two million daily transactions. Most recently I cut checkout drop-off by eighteen percent.',
  },
}

export function getDemoSpeechLine(
  slug: ToolSlug,
  purpose: DemoSpeechPurpose,
): string | null {
  const entry = DEMO_SPEECH[slug]
  if (!entry) return null
  return entry[purpose]
}

export function isAllowedDemoSpeech(
  slug: string,
  purpose: string,
  text: string,
): boolean {
  if (purpose !== 'greeting' && purpose !== 'question') return false
  const expected = getDemoSpeechLine(slug as ToolSlug, purpose)
  return expected !== null && text.trim() === expected
}

export const CAREER_DEMO_STORAGE_PREFIX = 'mycvroast-live-demo:'
