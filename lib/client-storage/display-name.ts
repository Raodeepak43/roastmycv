/** Guest display name — only used when user explicitly consented (onboarding or roast ticker). */
export const DISPLAY_NAME_KEY = 'rcv_display_name'
export const DISPLAY_NAME_CONSENT_KEY = 'rcv_name_consent'

export function hasDisplayNameConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DISPLAY_NAME_CONSENT_KEY) === '1'
}

export function getConsentedDisplayName(): string {
  if (!hasDisplayNameConsent()) return ''
  return localStorage.getItem(DISPLAY_NAME_KEY)?.trim() ?? ''
}

export function setConsentedDisplayName(name: string): void {
  const trimmed = name.trim()
  if (trimmed.length < 2) return
  localStorage.setItem(DISPLAY_NAME_KEY, trimmed)
  localStorage.setItem(DISPLAY_NAME_CONSENT_KEY, '1')
}

/** Clear name when user skips onboarding — no consent to prefill elsewhere. */
export function clearDisplayNameOnSkip(): void {
  localStorage.removeItem(DISPLAY_NAME_KEY)
  localStorage.removeItem(DISPLAY_NAME_CONSENT_KEY)
}

/** Strip name from resume data when guest has not consented to store it. */
export function stripUnconsentedName<T extends { personal: { fullName: string } }>(data: T): T {
  if (hasDisplayNameConsent()) return data
  if (!data.personal.fullName.trim()) return data
  return { ...data, personal: { ...data.personal, fullName: '' } }
}
