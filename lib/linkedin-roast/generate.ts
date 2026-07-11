import type { Intensity } from '@/app/api/roast/prompts'
import { completeRoastText } from '@/lib/roast/complete'

const languageInstructions: Record<string, string> = {
  hinglish: 'Respond in Hinglish — natural mix of Hindi and English. Use desi expressions. Feel like a friend roasting their LinkedIn.',
  english: 'Respond in fluent English. Savage Silicon Valley recruiter energy.',
}

const intensityInstructions: Record<string, string> = {
  clean: 'Be brutally honest but no swearing.',
  gaali_light: 'Mild frustration, friend-roasting tone.',
  savage: 'Maximum savage. No mercy on cringe LinkedIn clichés.',
}

export type LinkedInSectionScores = {
  headline: number
  about: number
  experience: number
  skills: number
  activity: number
}

export type LinkedInRoastResult = {
  score: number
  sectionScores: LinkedInSectionScores
  title: string
  lines: string[]
  verdict: string
  fixes: string[]
}

function buildSystemPrompt(language: string, intensity: string): string {
  const lang = languageInstructions[language] || languageInstructions.hinglish
  const int = intensityInstructions[intensity] || intensityInstructions.gaali_light

  return `You are a brutally honest LinkedIn profile reviewer. Roast this LinkedIn profile the same way you'd roast a bad resume.
${lang}
${int}

Return ONLY valid JSON:
{
  "score": <number 1-10 overall>,
  "sectionScores": {
    "headline": <1-10>,
    "about": <1-10>,
    "experience": <1-10>,
    "skills": <1-10>,
    "activity": <1-10>
  },
  "title": "<savage 6-8 word title>",
  "roast": "<numbered lines 01-10, brutal observations about the LinkedIn profile>",
  "verdict": "<one brutal one-liner>",
  "fixes": ["<fix 1>", "<fix 2>", "<fix 3>"]
}`
}

function extractJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\s?|\s?```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Invalid JSON response')
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
}

function parseLines(roast: string): string[] {
  const numbered = Array.from(roast.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*(.+)/g))
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10))
    .map((m) => m[2].trim())
    .filter(Boolean)
  if (numbered.length > 0) return numbered.slice(0, 12)
  return roast.split('\n').map((l) => l.replace(/^\s*\d{1,2}\.\s*/, '').trim()).filter((l) => l.length > 10).slice(0, 12)
}

function clampScore(n: unknown): number {
  const v = typeof n === 'number' ? n : parseInt(String(n), 10)
  if (Number.isNaN(v)) return 5
  return Math.min(10, Math.max(1, Math.round(v)))
}

export async function generateLinkedInRoast(
  profileText: string,
  intensity: Intensity,
  language: string,
): Promise<LinkedInRoastResult> {
  const trimmed = profileText.slice(0, 8000)
  const lang = language || 'hinglish'
  const raw = await completeRoastText({
    systemPrompt: buildSystemPrompt(lang, intensity),
    userMessage: `Roast this LinkedIn profile. Language: ${lang}. Intensity: ${intensity}.\n\n${trimmed}`,
    language: lang,
    intensity,
  })

  const parsed = extractJson(raw)
  const sections = (parsed.sectionScores ?? {}) as Record<string, unknown>

  return {
    score: clampScore(parsed.score),
    sectionScores: {
      headline: clampScore(sections.headline),
      about: clampScore(sections.about),
      experience: clampScore(sections.experience),
      skills: clampScore(sections.skills),
      activity: clampScore(sections.activity),
    },
    title: String(parsed.title ?? 'LinkedIn needs CPR'),
    lines: parseLines(String(parsed.roast ?? '')),
    verdict: String(parsed.verdict ?? ''),
    fixes: Array.isArray(parsed.fixes) ? parsed.fixes.map(String).slice(0, 3) : [],
  }
}
