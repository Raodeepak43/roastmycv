'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type UpgradeModalProps = {
  open: boolean
  onClose: () => void
  /** paywall = payment coming soon; login = sign in to continue on dashboard */
  mode?: 'paywall' | 'login'
  loginNext?: string
}

export function UpgradeModal({
  open,
  onClose,
  mode = 'paywall',
  loginNext = '/dashboard/resume-builder',
}: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={onClose}
    >
      <div
        className="neo-frame neo-frame--ember bg-[#0F0F0F] p-6 md:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'login' ? (
          <>
            <h2 id="upgrade-title" className="font-display text-2xl text-white mb-2">
              Sign in to continue
            </h2>
            <p className="font-body text-[13px] text-dim mb-6">
              Your <strong className="text-white">1 free PDF</strong> on this page is used. Create a free account to
              unlock AI bullet improvements, more PDF exports, and save progress on your dashboard.
            </p>
            <ul className="space-y-2 mb-6 list-none m-0 p-0">
              {[
                '3 more PDF exports (free plan)',
                '5 AI bullet improvements',
                'Resume + roast history in dashboard',
              ].map((item) => (
                <li key={item} className="font-body text-[13px] text-white flex gap-2">
                  <span className="text-ember">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={loginHref}
              className="btn-roast w-full py-3 text-base mb-3 inline-flex items-center justify-center"
            >
              Sign in with Google
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full font-body text-[13px] text-dim hover:text-white py-2 transition-colors"
            >
              Maybe later
            </button>
          </>
        ) : (
          <>
            <h2 id="upgrade-title" className="font-display text-2xl text-white mb-2">
              Upgrade to Pro
            </h2>
            <p className="font-body text-[13px] text-dim mb-6">
              Free limit reached. Unlock unlimited AI improvements and PDF downloads.
            </p>
            <ul className="space-y-2 mb-6 list-none m-0 p-0">
              {[
                'Unlimited PDF downloads',
                'Unlimited AI bullet improvements',
                'All templates (coming soon)',
                'Cover letter generator (coming soon)',
              ].map((item) => (
                <li key={item} className="font-body text-[13px] text-white flex gap-2">
                  <span className="text-ember">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="font-display text-3xl text-ember mb-4">₹149</p>
            <button
              type="button"
              className="btn-roast w-full py-3 text-base mb-3 opacity-60 cursor-not-allowed"
              disabled
            >
              Payment coming soon
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full font-body text-[13px] text-dim hover:text-white py-2 transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
