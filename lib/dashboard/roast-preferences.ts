import type { IntensityKey } from '@/app/i18n'
import { ROAST_INTENSITY_IDS } from '@/lib/roast/client'

export interface RoastPreferences {
  language: string
  intensity: IntensityKey
}

const PREFIX = 'mcr_dash_roast_prefs_'

function key(userId: string) {
  return `${PREFIX}${userId}`
}

export function getRoastPreferences(userId: string): RoastPreferences | null {
  if (typeof window === 'undefined' || !userId) return null
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<RoastPreferences>
    if (
      typeof parsed.language === 'string' &&
      parsed.intensity &&
      ROAST_INTENSITY_IDS.includes(parsed.intensity)
    ) {
      return { language: parsed.language, intensity: parsed.intensity }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function saveRoastPreferences(userId: string, prefs: RoastPreferences): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.setItem(key(userId), JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
