import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { RESUME_CHAR_LIMIT } from '@/app/api/roast/prompts'
import { applyPrefill, heuristicExtract, parseExtractedResume } from '@/lib/resume-builder/prefill'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 45

const EXTRACT_CHAR_LIMIT = 8000

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You extract structured resume data from raw resume text for an Indian job seeker.
Return ONLY valid JSON matching this shape — no markdown, no commentary:
{
  "personal": {
    "fullName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "jobTitle": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": ["", ""]
    }
  ],
  "projects": [
    {
      "name": "",
      "techStack": "",
      "description": ""
    }
  ],
  "skills": {
    "languages": "",
    "frameworks": "",
    "tools": "",
    "databases": ""
  },
  "education": {
    "degree": "",
    "university": "",
    "gradYear": "",
    "gpa": ""
  },
  "achievements": [""]
}

Rules:
- Extract ONLY information clearly present in the resume text.
- Do NOT invent companies, dates, metrics, or skills.
- Leave fields as empty strings if not found.
- Use empty arrays if a section is missing.
- Keep bullet points as written (trim whitespace).
- For Indian resumes, preserve phone format as found.
- endDate can be "Present" if currently employed.`

function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```json\s?|\s?```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Invalid JSON')
  return JSON.parse(cleaned.slice(start, end + 1))
}

export async function POST(req: NextRequest) {
  let text = ''
  try {
    let body: { text?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    text = typeof body.text === 'string' ? body.text.trim() : ''
    if (text.length < 50) {
      return NextResponse.json({ error: 'Resume text too short' }, { status: 400 })
    }

    const clipped = text.slice(0, Math.max(EXTRACT_CHAR_LIMIT, RESUME_CHAR_LIMIT))

    if (!process.env.ANTHROPIC_API_KEY?.trim()) {
      const data = heuristicExtract(clipped)
      return NextResponse.json({ data, source: 'heuristic' })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Extract resume fields from this text:\n\n${clipped}` }],
    })

    const block = message.content[0]
    const raw = block.type === 'text' ? block.text : ''
    const parsed = parseExtractedResume(extractJson(raw))
    const data = applyPrefill(parsed)

    return NextResponse.json({ data, source: 'ai' })
  } catch (err) {
    console.error('[resume-builder/extract]', err)
    if (text.length >= 50) {
      const data = heuristicExtract(text.slice(0, EXTRACT_CHAR_LIMIT))
      return NextResponse.json({ data, source: 'heuristic-fallback' })
    }
    return NextResponse.json({ error: 'Could not extract resume data' }, { status: 500 })
  }
}
