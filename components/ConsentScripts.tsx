'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  ADSENSE_CLIENT,
  hasAnalyticsConsent,
  onConsentChange,
} from '@/lib/cookie-consent'

/** AdSense only — GA4 gtag loads in app/layout.tsx <head>. */
export function ConsentScripts() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(hasAnalyticsConsent())
    return onConsentChange((value) => setAllowed(value === 'all'))
  }, [])

  if (!allowed) return null

  return (
    <Script
      id="adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}

/** Read consent on client without loading scripts (e.g. ad slot placeholders). */
export function useAnalyticsConsent(): boolean {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(hasAnalyticsConsent())
    return onConsentChange((value) => setAllowed(value === 'all'))
  }, [])

  return allowed
}
