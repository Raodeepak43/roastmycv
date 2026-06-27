export const PINNED_TICKER_KEY = 'rcv_pinned_ticker'

const LANG_LABELS: Record<string, string> = {
  hinglish: 'Hinglish',
  english: 'English',
  spanish: 'Spanish',
  portuguese: 'Português',
  french: 'Français',
  german: 'Deutsch',
  arabic: 'العربية',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Русский',
  chinese: '中文',
  turkish: 'Türkçe',
  indonesian: 'Indonesia',
  italian: 'Italiano',
  dutch: 'Nederlands',
}

export function formatTickerLanguage(code?: string): string {
  if (!code) return ''
  return LANG_LABELS[code] ?? code.charAt(0).toUpperCase() + code.slice(1)
}

export function buildTickerMessage(name: string, score?: number, language?: string): string {
  const first = name.trim().split(/\s+/)[0]
  const lang = formatTickerLanguage(language)
  const langBit = lang ? ` · ${lang}` : ''
  if (score != null && !Number.isNaN(score)) {
    return `💀 ${first} got roasted — ${score}/10${langBit}`
  }
  return `🔥 ${first} just roasted their CV${langBit}`
}

export function mergeTickerItems(pinned: string | null, items: string[]): string[] {
  if (!pinned) return items
  return [pinned, ...items.filter((item) => item !== pinned)]
}
