import type { IntensityKey } from '@/app/i18n'

export type PublicRoastSaveInput = {
  score: number
  intensity: IntensityKey
  language: string
  lines: string[]
  title?: string
  verdict?: string
  fixes?: string[]
}

export async function savePublicRoastViaApi(input: PublicRoastSaveInput): Promise<string | null> {
  try {
    const res = await fetch('/api/public-roasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { share_token?: string }
    return typeof data.share_token === 'string' ? data.share_token : null
  } catch {
    return null
  }
}
