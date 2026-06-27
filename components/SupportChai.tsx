'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  getUpiQrImageUrl,
  SUPPORT_UPI_ID,
  SUPPORT_UPI_NAME,
} from '@/lib/support'
import type { SupportCopy } from '@/app/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

function SupportModal({
  open,
  onClose,
  strings,
}: {
  open: boolean
  onClose: () => void
  strings: SupportCopy
}) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const qrUrl = getUpiQrImageUrl()
  const reduce = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const copyUpi = useCallback(async () => {
    if (!SUPPORT_UPI_ID) return
    try {
      await navigator.clipboard.writeText(SUPPORT_UPI_ID)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  const modalBody = (
    <div
      className="support-modal relative w-[min(100vw-2rem,28rem)] min-w-[280px]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 font-body text-xl text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>

      <p className="font-body text-[11px] text-orange tracking-[0.14em] mb-3">{strings.tag}</p>
      <h2
        id="support-chai-title"
        className="font-display text-3xl md:text-[2.5rem] text-white leading-none mb-4 pr-8"
      >
        {strings.title}
      </h2>
      <p className="font-body text-[13px] text-dim leading-relaxed mb-6">{strings.desc}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange text-black font-body text-[11px] font-medium">
          01
        </span>
        <span className="font-body text-[11px] text-white tracking-[0.08em] uppercase">
          {strings.upiLabel}
        </span>
      </div>

      {qrUrl ? (
        <div className="bg-black border border-white/20 p-5 mb-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`UPI QR code — ${SUPPORT_UPI_NAME}`}
            width={260}
            height={320}
            className="mx-auto w-full max-w-[260px] h-auto object-contain"
          />
          <p className="font-body text-[10px] text-dim mt-3 tracking-[0.12em] uppercase">
            {strings.scanHint}
          </p>
        </div>
      ) : (
        <p className="font-body text-[13px] text-muted border border-border p-4 mb-4">
          {strings.noUpi}
        </p>
      )}

      {SUPPORT_UPI_ID && (
        <div className="flex border border-white/90 overflow-hidden">
          <div className="flex-1 px-4 py-3 font-body text-[13px] text-white truncate">
            {SUPPORT_UPI_ID}
          </div>
          <button
            type="button"
            onClick={copyUpi}
            className="shrink-0 px-4 py-3 border-l border-white/90 font-body text-[11px] text-white hover:bg-white/5 transition-colors uppercase tracking-wider inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? strings.copied : strings.copy}
          </button>
        </div>
      )}
    </div>
  )

  if (!mounted) return null

  const overlayClass =
    'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain'

  const overlay = reduce ? (
    open ? (
      <div
        className={overlayClass}
        style={{ background: 'rgba(0,0,0,0.92)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-chai-title"
        onClick={onClose}
      >
        {modalBody}
      </div>
    ) : null
  ) : (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="support-chai-overlay"
          className={overlayClass}
          style={{ background: 'rgba(0,0,0,0.92)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chai-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {modalBody}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.body)
}

export function SupportChaiButton({
  strings,
  className = '',
  variant = 'outline',
}: {
  strings: SupportCopy
  className?: string
  variant?: 'outline' | 'solid' | 'ghost'
}) {
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  const base =
    variant === 'solid'
      ? 'btn-roast font-body text-[13px] px-4 py-2 rounded-full'
      : variant === 'ghost'
        ? 'font-body text-[14px] text-[#B8B8B8] hover:text-white transition-colors p-0 border-0 bg-transparent text-left'
        : 'font-body text-[13px] text-dim hover:text-orange transition-colors border border-border hover:border-orange px-3 py-1.5 rounded-full'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${base} ${className}`.trim()}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {strings.trigger}
      </button>
      <SupportModal open={open} onClose={onClose} strings={strings} />
    </>
  )
}

export function SupportChaiBlock({
  strings,
  className = '',
}: {
  strings: SupportCopy
  className?: string
}) {
  return (
    <SupportChaiButton
      strings={strings}
      variant="solid"
      className={`w-full py-3 text-base ${className}`.trim()}
    />
  )
}
