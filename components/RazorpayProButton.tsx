'use client'

import { useCallback, useEffect, useState } from 'react'
import { PRO_PRICE_INR } from '@/lib/plans'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const PENDING_KEY = 'mycvroast_pending_pro_payment'

type PendingPayment = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  fp?: string
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Razorpay script failed'))
    document.body.appendChild(script)
  })
}

function readPending(): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingPayment
  } catch {
    return null
  }
}

function savePending(payment: PendingPayment) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(payment))
}

function clearPending() {
  sessionStorage.removeItem(PENDING_KEY)
}

async function verifyPayment(payment: PendingPayment) {
  const verifyRes = await fetch('/api/payments/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payment),
  })
  const verifyData = await verifyRes.json()
  if (!verifyRes.ok) {
    throw new Error(verifyData.error || 'Payment verification failed')
  }
}

type RazorpayProButtonProps = {
  fp?: string | null
  className?: string
  children: React.ReactNode
  onSuccess?: () => void
  disabled?: boolean
}

export function RazorpayProButton({ fp, className, children, onSuccess, disabled }: RazorpayProButtonProps) {
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<PendingPayment | null>(null)
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  useEffect(() => {
    setPending(readPending())
  }, [])

  const finishSuccess = useCallback(() => {
    clearPending()
    setPending(null)
    onSuccess?.()
  }, [onSuccess])

  const retryActivation = useCallback(async () => {
    const saved = pending ?? readPending()
    if (!saved) return

    setLoading(true)
    try {
      await verifyPayment(saved)
      finishSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Activation failed'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }, [pending, finishSuccess])

  const pay = useCallback(async () => {
    if (!keyId) {
      alert('Payments are not configured yet.')
      return
    }

    setLoading(true)
    try {
      await loadRazorpayScript()

      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fp ? { fp } : {}),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not start payment')
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: orderData.keyId || keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MyCVRoast',
          description: `Pro — unlimited roasts (₹${PRO_PRICE_INR} one-time)`,
          order_id: orderData.orderId,
          theme: { color: '#ff4500' },
          handler: async (response: PendingPayment) => {
            const payload = { ...response, ...(fp ? { fp } : {}) }
            try {
              await verifyPayment(payload)
              clearPending()
              resolve()
            } catch (err) {
              savePending(payload)
              setPending(payload)
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        })
        rzp.open()
      })

      finishSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      if (msg !== 'Payment cancelled') alert(msg)
    } finally {
      setLoading(false)
    }
  }, [fp, keyId, finishSuccess])

  if (!keyId) return null

  if (pending) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className={className}
          onClick={retryActivation}
          disabled={disabled || loading}
        >
          {loading ? 'Activating Pro…' : 'Retry Pro activation (payment received)'}
        </button>
        <p className="text-center text-xs text-gray-500">
          Your payment went through — tap to finish upgrading your account.
        </p>
      </div>
    )
  }

  return (
    <button type="button" className={className} onClick={pay} disabled={disabled || loading}>
      {loading ? 'Opening Razorpay…' : children}
    </button>
  )
}
