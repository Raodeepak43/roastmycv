export type OnboardingPage = 'roast' | 'resume-builder' | 'plans'

const ONBOARDED_KEY = 'mcr_dash_onboarded_'
const VISITS_KEY = 'mcr_dash_visits_'

function visitsKey(userId: string) {
  return `${VISITS_KEY}${userId}`
}

function onboardedKey(userId: string) {
  return `${ONBOARDED_KEY}${userId}`
}

export function isOnboarded(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return true
  try {
    return localStorage.getItem(onboardedKey(userId)) === '1'
  } catch {
    return true
  }
}

export function setOnboarded(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.setItem(onboardedKey(userId), '1')
  } catch {
    /* ignore */
  }
}

export function markPageVisited(userId: string, page: OnboardingPage): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    const raw = localStorage.getItem(visitsKey(userId))
    const visits = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    if (visits[page]) return
    visits[page] = true
    localStorage.setItem(visitsKey(userId), JSON.stringify(visits))
  } catch {
    /* ignore */
  }
}

export function getOnboardingProgress(userId: string): Record<OnboardingPage, boolean> {
  const empty = { roast: false, 'resume-builder': false, plans: false }
  if (typeof window === 'undefined' || !userId) return empty
  try {
    const raw = localStorage.getItem(visitsKey(userId))
    if (!raw) return empty
    const visits = JSON.parse(raw) as Partial<Record<OnboardingPage, boolean>>
    return {
      roast: Boolean(visits.roast),
      'resume-builder': Boolean(visits['resume-builder']),
      plans: Boolean(visits.plans),
    }
  } catch {
    return empty
  }
}
