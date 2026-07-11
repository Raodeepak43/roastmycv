'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getCookieConsent,
  setCookieConsent,
  onConsentChange,
} from '@/lib/cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === null)
    return onConsentChange((value) => setVisible(value === null))
  }, [])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-white/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <p id="cookie-consent-title" className="font-display text-sm text-text-dark md:text-base">
            Cookies &amp; privacy
          </p>
          <p id="cookie-consent-desc" className="mt-1 font-body text-xs leading-relaxed text-dim md:text-sm">
            We use essential cookies to run the site. With your permission we also load Google Analytics and AdSense
            to improve the product and show ads.{' '}
            <Link href="/privacy" className="text-orange underline-offset-2 hover:underline">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setCookieConsent('essential')}
            className="rounded-lg border border-border bg-bg-beige px-4 py-2.5 font-body text-sm text-dim transition-colors hover:border-orange hover:text-text-dark"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent('all')}
            className="btn-roast rounded-lg px-4 py-2.5 text-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
