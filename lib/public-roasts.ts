import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import type { IntensityKey } from '@/app/i18n'

export interface PublicRoastRow {
  id: string
  created_at: string
  score: number
  intensity: IntensityKey
  language: string
  summary: string
  top_issues: string[]
  is_public: boolean
  share_token: string
}

export interface SavePublicRoastInput {
  score: number
  intensity: IntensityKey
  language: string
  lines: string[]
  title?: string
  verdict?: string
  fixes?: string[]
}

function shortenIssue(text: string, maxWords = 8): string {
  const cleaned = text.replace(/^\d+\.\s*/, '').trim()
  return cleaned.split(/\s+/).slice(0, maxWords).join(' ')
}

/** Strip likely personal names (Title Case pairs) from shared text. */
function anonymize(text: string): string {
  return text
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Name]')
    .replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/g, '[email]')
    .replace(/\b\+?\d[\d\s-]{8,}\d\b/g, '[phone]')
}

export function buildPublicRoastPayload(input: SavePublicRoastInput): {
  summary: string
  top_issues: string[]
} {
  const summaryParts: string[] = []

  if (input.title?.trim()) {
    summaryParts.push(anonymize(input.title.trim()))
  }

  for (const line of input.lines.slice(0, 2)) {
    const cleaned = anonymize(line.replace(/^\d+\.\s*/, '').trim())
    if (cleaned.length > 20) summaryParts.push(cleaned)
  }

  if (input.verdict?.trim() && summaryParts.length < 3) {
    summaryParts.push(anonymize(input.verdict.trim()))
  }

  const summary = summaryParts.slice(0, 3).join(' ').slice(0, 600)

  const fromFixes = (input.fixes ?? []).map((f) => shortenIssue(f))
  const fromLines = input.lines.map((l) => shortenIssue(l))
  const top_issues = [...fromFixes, ...fromLines].filter(Boolean).slice(0, 3)

  while (top_issues.length < 3 && input.lines.length > top_issues.length) {
    const next = shortenIssue(input.lines[top_issues.length])
    if (next && !top_issues.includes(next)) top_issues.push(next)
    else break
  }

  return {
    summary: summary || 'AI found several issues with this resume.',
    top_issues: top_issues.length > 0 ? top_issues : ['Resume needs stronger impact metrics', 'Missing ATS keywords', 'Weak professional summary'],
  }
}

export function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

export async function savePublicRoast(input: SavePublicRoastInput): Promise<PublicRoastRow | null> {
  if (!isSupabaseConfigured()) return null

  const sb = getSupabaseAdmin()
  const { summary, top_issues } = buildPublicRoastPayload(input)
  const share_token = generateShareToken()

  const { data, error } = await sb
    .from('public_roasts')
    .insert({
      score: input.score,
      intensity: input.intensity,
      language: input.language,
      summary,
      top_issues,
      is_public: true,
      share_token,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[savePublicRoast]', error.message)
    return null
  }

  return data as PublicRoastRow
}

export async function getPublicRoastByToken(token: string): Promise<PublicRoastRow | null> {
  if (!isSupabaseConfigured() || !token.trim()) return null

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('public_roasts')
    .select('*')
    .eq('share_token', token.trim())
    .maybeSingle()

  if (error || !data) return null
  return data as PublicRoastRow
}

export async function setPublicRoastVisibility(token: string, isPublic: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  const sb = getSupabaseAdmin()
  const { error } = await sb
    .from('public_roasts')
    .update({ is_public: isPublic })
    .eq('share_token', token.trim())

  return !error
}

export function publicRoastScoreColor(score: number): string {
  if (score <= 3) return '#e24b4a'
  if (score <= 6) return '#eda100'
  return '#0ca30c'
}

export const INTENSITY_BADGES: Record<IntensityKey, string> = {
  clean: '😇 Clean',
  gaali_light: '😏 Gaali Light',
  savage: '💀 Savage',
}
