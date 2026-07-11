import type { IntensityKey } from '@/app/i18n'
import { FREE_LIMIT } from '@/lib/usage'

export const ROAST_FREE_LIMIT = FREE_LIMIT

export const ROAST_LANGUAGES = [
  { code: 'hinglish', flag: '🇮🇳', name: 'Hinglish' },
  { code: 'english', flag: '🇺🇸', name: 'English' },
  { code: 'spanish', flag: '🇪🇸', name: 'Spanish' },
  { code: 'portuguese', flag: '🇧🇷', name: 'Português' },
  { code: 'french', flag: '🇫🇷', name: 'Français' },
  { code: 'german', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'arabic', flag: '🇸🇦', name: 'العربية' },
  { code: 'japanese', flag: '🇯🇵', name: '日本語' },
  { code: 'korean', flag: '🇰🇷', name: '한국어' },
  { code: 'russian', flag: '🇷🇺', name: 'Русский' },
  { code: 'chinese', flag: '🇨🇳', name: '中文' },
  { code: 'turkish', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'indonesian', flag: '🇮🇩', name: 'Indonesia' },
  { code: 'italian', flag: '🇮🇹', name: 'Italiano' },
  { code: 'dutch', flag: '🇳🇱', name: 'Nederlands' },
] as const

export const ROAST_INTENSITY_IDS: IntensityKey[] = ['clean', 'gaali_light', 'savage']

async function fetchJson<T>(url: string, options?: RequestInit, fallbackError = 'Something went wrong'): Promise<T> {
  const res = await fetch(url, options)
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error(fallbackError)
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? fallbackError)
  return data as T
}

function parseRoastLines(buffer: string): string[] {
  const cleaned = buffer.replace(/```[\s\S]*?```/g, '').trim()
  const numbered = Array.from(cleaned.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*(.+)/g))
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10))
    .map((m) => m[2].trim())
    .filter(Boolean)
  if (numbered.length > 0) return numbered
  return cleaned.split('\n').map((l) => l.replace(/^\s*\d{1,2}\.\s*/, '').trim()).filter((l) => l.length > 10)
}

interface RoastApiResponse {
  score: number
  title: string
  roast: string
  verdict: string
  fixes: string[]
  statsCount?: number
  usesLeft?: number
  used?: number
  paid?: boolean
}

export async function fetchRoast(
  resumeText: string,
  intensity: IntensityKey,
  language: string,
  fp: string,
  incompleteError: string,
) {
  const data = await fetchJson<RoastApiResponse>(
    '/api/roast',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ resumeText, intensity, language, fp }),
    },
    incompleteError,
  )
  const lines = parseRoastLines(data.roast)
  if (lines.length < 6) throw new Error(incompleteError)
  return {
    lines: lines.slice(0, 12),
    score: data.score,
    title: data.title,
    verdict: data.verdict,
    fixes: data.fixes?.length ? data.fixes : undefined,
    language,
    statsCount: data.statsCount,
    usesLeft: data.usesLeft,
    used: data.used,
    paid: data.paid,
  }
}

export async function fetchJsonSafe<T>(url: string, options?: RequestInit, fallbackError = 'Something went wrong') {
  return fetchJson<T>(url, options, fallbackError)
}
