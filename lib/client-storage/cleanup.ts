/** Prefixes for site data that should not survive sign-out / account deletion. */
const LOCAL_PREFIXES = [
  'mcr_dash_usage_',
  'mcr_dash_history_',
  'mcr_dash_cv_',
  'mcr_dash_onboarded_',
  'mcr_dash_visits_',
  'mcr_dash_roast_prefs_',
  'mcr_rb_draft_',
  'rcv_fix_done_',
] as const

const LOCAL_EXACT_KEYS = [
  'rcv_onboarded',
  'rcv_display_name',
  'rcv_name_consent',
  'rcv_email',
  'rb_ai_uses',
  'rb_pdf_downloads',
  'rb_paid',
  'mcr_rb_draft_public',
] as const

const SESSION_PREFIXES = ['rcv_roast_', 'rcv_prefill_'] as const
const SESSION_EXACT_KEYS = ['rcv_roast_ids', 'rcv_pinned_ticker', 'mcr_razorpay_pending'] as const

function removeByPrefix(storage: Storage, prefixes: readonly string[]) {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key) continue
    if (prefixes.some((p) => key.startsWith(p))) keys.push(key)
  }
  keys.forEach((k) => storage.removeItem(k))
}

/** Clear dashboard + builder caches for one user (call on sign-out / delete). */
export function clearUserSiteStorage(userId?: string): void {
  if (typeof window === 'undefined') return
  try {
    if (userId) {
      localStorage.removeItem(`mcr_dash_usage_${userId}`)
      localStorage.removeItem(`mcr_dash_history_${userId}`)
      localStorage.removeItem(`mcr_dash_cv_${userId}`)
      localStorage.removeItem(`mcr_dash_onboarded_${userId}`)
      localStorage.removeItem(`mcr_dash_visits_${userId}`)
      localStorage.removeItem(`mcr_dash_roast_prefs_${userId}`)
      localStorage.removeItem(`mcr_rb_draft_${userId}`)
    }
    removeByPrefix(localStorage, LOCAL_PREFIXES)
    LOCAL_EXACT_KEYS.forEach((k) => localStorage.removeItem(k))
    removeByPrefix(sessionStorage, SESSION_PREFIXES)
    SESSION_EXACT_KEYS.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    /* ignore quota / private mode */
  }
}
