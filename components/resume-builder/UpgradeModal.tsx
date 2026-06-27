'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={onClose}
    >
      <div
        className="neo-frame neo-frame--orange bg-[#0F0F0F] p-6 md:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
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
              <span className="text-orange">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="font-display text-3xl text-orange mb-4">₹149</p>
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
      </div>
    </div>,
    document.body,
  )
}
