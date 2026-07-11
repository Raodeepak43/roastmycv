export const COOKIE_CONSENT_KEY = 'cookie_consent'

/** `all` = analytics + ads; `essential` = no GA4 / AdSense */
export type CookieConsentValue = 'all' | 'essential'

export const ADSENSE_CLIENT = 'ca-pub-8959559679161401'

export const CONSENT_CHANGE_EVENT = 'cookie-consent-change'

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (value === 'all' || value === 'essential') return value
  return null
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'all'
}

export function setCookieConsent(value: CookieConsentValue): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }))
}

export function onConsentChange(handler: (value: CookieConsentValue | null) => void): () => void {
  const read = () => handler(getCookieConsent())

  const onStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_CONSENT_KEY) read()
  }

  const onCustom = () => read()

  window.addEventListener('storage', onStorage)
  window.addEventListener(CONSENT_CHANGE_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CONSENT_CHANGE_EVENT, onCustom)
  }
}
