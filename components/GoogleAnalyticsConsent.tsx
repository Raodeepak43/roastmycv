'use client'

import { useEffect } from 'react'
import { hasAnalyticsConsent, onConsentChange } from '@/lib/cookie-consent'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function applyGtagConsent(granted: boolean) {
  if (typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  })
}

/** Sync GA4 consent mode with cookie banner choice (tag loads in <head> from layout). */
export function GoogleAnalyticsConsent() {
  useEffect(() => {
    applyGtagConsent(hasAnalyticsConsent())
    return onConsentChange((value) => applyGtagConsent(value === 'all'))
  }, [])

  return null
}
