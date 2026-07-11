import { RESUME_CHAR_LIMIT, type Intensity } from '@/app/api/roast/prompts'
import { completeRoastText, hasRoastLlmKey } from '@/lib/roast/complete'

const languageInstructions: Record<string, string> = {
  hinglish: "Respond in Hinglish — natural mix of Hindi and English like Indian millennials speak.",
  english: 'Respond in fluent English. Be savage, witty, like a brutally honest Silicon Valley recruiter.',
  spanish: 'Responde completamente en español.',
  portuguese: 'Responda completamente em português brasileiro.',
  french: 'Réponds entièrement en français.',
  german: 'Antworte komplett auf Deutsch.',
  arabic: 'أجب باللغة العربية الفصحى.',
  japanese: '完全に日本語で返答してください。',
  korean: '완전히 한국어로 답변하세요.',
  russian: 'Отвечай полностью на русском языке.',
  chinese: '请完全用中文回答。',
  turkish: 'Tamamen Türkçe yanıtla.',
  indonesian: 'Jawab sepenuhnya dalam Bahasa Indonesia.',
  italian: 'Rispondi completamente in italiano.',
  dutch: 'Antwoord volledig in het Nederlands.',
}

const intensityInstructions: Record<string, string> = {
  clean: 'Be brutally honest but no swearing. Professional savage mode.',
  gaali_light: 'Use mild expressions of frustration. Keep it like roasting a close friend.',
  savage: 'Maximum savage. No mercy. Destroy every weakness. Still give real fixes at end.',
}

function buildSystemPrompt(language: string, intensity: string): string {
  const selectedLang = languageInstructions[language] || languageInstructions.hinglish
  const selectedIntensity = intensityInstructions[intensity] || intensityInstructions.clean
  return `You are a brutally honest AI resume roaster. 
${selectedLang}
${selectedIntensity}

Analyze the resume and return ONLY valid JSON, nothing else:
{
  "score": <number 1-10>,
  "title": "<savage 6-8 word title in the selected language>",
  "roast": "<numbered lines 01-12, each line one brutal observation in selected language>",
  "verdict": "<one brutal one-liner in selected language>",
  "fixes": ["<fix 1 in selected language>", "<fix 2>", "<fix 3>"]
}`
}

function extractJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\s?|\s?```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Invalid JSON response')
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
}

export function parseRoastLines(buffer: string): string[] {
  const cleaned = buffer.replace(/```[\s\S]*?```/g, '').trim()
  const numbered = Array.from(cleaned.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*(.+)/g))
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10))
    .map((m) => m[2].trim())
    .filter(Boolean)
  if (numbered.length > 0) return numbered
  return cleaned.split('\n').map((l) => l.replace(/^\s*\d{1,2}\.\s*/, '').trim()).filter((l) => l.length > 10)
}

export interface GeneratedRoast {
  score: number
  title: string
  roast: string
  lines: string[]
  verdict: string
  fixes: string[]
  intensity: Intensity
  language: string
}

export async function generateRoast(
  resumeText: string,
  intensity = 'gaali_light',
  language = 'hinglish',
): Promise<GeneratedRoast> {
  if (!hasRoastLlmKey()) {
    throw new Error('API key missing')
  }

  const level = (['clean', 'gaali_light', 'savage'].includes(intensity) ? intensity : 'gaali_light') as Intensity
  const lang = typeof language === 'string' ? language : 'hinglish'
  const trimmed = resumeText.slice(0, RESUME_CHAR_LIMIT)
  const systemPrompt = buildSystemPrompt(lang, level)

  const raw = await completeRoastText({
    systemPrompt,
    userMessage: `Analyze and roast this resume. Every field in your JSON response MUST be written in the language from the system instructions (code: ${lang}):\n\n${trimmed}`,
    language: lang,
    intensity: level,
  })

  const parsed = extractJson(raw)
  const score = typeof parsed.score === 'number' ? Math.min(10, Math.max(1, parsed.score)) : 5
  const roast = String(parsed.roast ?? '')
  const lines = parseRoastLines(roast)

  if (lines.length < 6) {
    throw new Error('Incomplete roast response')
  }

  return {
    score,
    title: String(parsed.title ?? ''),
    roast,
    lines: lines.slice(0, 12),
    verdict: String(parsed.verdict ?? ''),
    fixes: Array.isArray(parsed.fixes) ? parsed.fixes.map(String).slice(0, 3) : [],
    intensity: level,
    language: lang,
  }
}
