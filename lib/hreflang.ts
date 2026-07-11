import { siteUrl } from '@/lib/seo'

/** BCP 47 hreflang → roast UI lang query param */
export const HREFLANG_MAP: Record<string, string> = {
  en: 'english',
  hi: 'hinglish',
  es: 'spanish',
  pt: 'portuguese',
  fr: 'french',
  de: 'german',
  ar: 'arabic',
  ja: 'japanese',
  ko: 'korean',
  ru: 'russian',
  zh: 'chinese',
  tr: 'turkish',
  id: 'indonesian',
  it: 'italian',
  nl: 'dutch',
}

export function hreflangAlternates(): Record<string, string> {
  const languages: Record<string, string> = {
    'x-default': siteUrl('/'),
    en: siteUrl('/'),
  }

  for (const [hreflang, uiLang] of Object.entries(HREFLANG_MAP)) {
    if (hreflang === 'en') continue
    languages[hreflang] = siteUrl(`/?lang=${uiLang}`)
  }

  return languages
}
