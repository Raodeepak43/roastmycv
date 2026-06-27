import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRoastModel, RESUME_CHAR_LIMIT, type Intensity } from './prompts'
import { isLimitReached } from '@/lib/usage'
import { incrementStatsCount } from '@/lib/stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const languageInstructions: Record<string, string> = {
  hinglish: "Respond in Hinglish — natural mix of Hindi and English like Indian millennials speak. Use words like 'yaar', 'bhai', 'kya bakwaas', 'saala', 'matlab'. Feel like a desi friend roasting you.",
  english: 'Respond in fluent English. Be savage, witty, like a brutally honest Silicon Valley recruiter.',
  spanish: 'Responde completamente en español. Sé brutal y gracioso como un reclutador latino sin filtros.',
  portuguese: 'Responda completamente em português brasileiro. Seja brutal e engraçado como um recrutador sem filtro.',
  french: 'Réponds entièrement en français. Sois brutal et sarcastique comme un recruteur parisien snob.',
  german: 'Antworte komplett auf Deutsch. Sei brutal direkt wie ein typisch deutscher Recruiter ohne Umschweife.',
  arabic: 'أجب باللغة العربية الفصحى. كن صريحاً وقاسياً مثل مدير توظيف عربي صارم.',
  japanese: '完全に日本語で返答してください。厳しく正直な採用担当者として、ユーモアを交えて批評してください。',
  korean: '완전히 한국어로 답변하세요. 솔직하고 냉정한 한국 채용담당자처럼 냉혹하게 비판하세요.',
  russian: 'Отвечай полностью на русском языке. Будь жёстким и саркастичным как строгий российский рекрутер.',
  chinese: '请完全用中文回答。像一个严格的中国招聘官一样，直接犀利地批评简历。',
  turkish: 'Tamamen Türkçe yanıtla. Acımasız ve dürüst bir Türk işe alım uzmanı gibi eleştir.',
  indonesian: 'Jawab sepenuhnya dalam Bahasa Indonesia. Jadilah seperti rekruter Indonesia yang jujur dan tanpa basa-basi.',
  italian: 'Rispondi completamente in italiano. Sii brutale e sarcastico come un recruiter italiano senza peli sulla lingua.',
  dutch: 'Antwoord volledig in het Nederlands. Wees direct en meedogenloos zoals een typisch Nederlandse recruiter.',
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

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key missing — .env.local check karo' }, { status: 500 })
    }

    let body: { resumeText?: string; intensity?: string; language?: string; fp?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { resumeText, intensity = 'gaali_light', language = 'hinglish', fp } = body

    const paid = false // Razorpay verification later
    if (fp && typeof fp === 'string' && (await isLimitReached(fp, paid))) {
      return NextResponse.json({ error: 'Free limit reached' }, { status: 429 })
    }

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text required' }, { status: 400 })
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Resume text too short' }, { status: 400 })
    }

    const level = (['clean', 'gaali_light', 'savage'].includes(intensity) ? intensity : 'gaali_light') as Intensity
    const lang = typeof language === 'string' ? language : 'hinglish'
    const trimmed = resumeText.slice(0, RESUME_CHAR_LIMIT)
    const model = getRoastModel(level)
    const systemPrompt = buildSystemPrompt(lang, level)

    const message = await client.messages.create({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Analyze and roast this resume. Every field in your JSON response MUST be written in the language from the system instructions (code: ${lang}):\n\n${trimmed}` }],
    })

    const raw = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const parsed = extractJson(raw)
    const score = typeof parsed.score === 'number' ? Math.min(10, Math.max(1, parsed.score)) : 5
    const statsCount = await incrementStatsCount()

    return NextResponse.json({
      score,
      title: String(parsed.title ?? ''),
      roast: String(parsed.roast ?? ''),
      verdict: String(parsed.verdict ?? ''),
      fixes: Array.isArray(parsed.fixes) ? parsed.fixes.map(String).slice(0, 3) : [],
      statsCount,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Kuch gadbad ho gayi, dobara try karo' }, { status: 500 })
  }
}
