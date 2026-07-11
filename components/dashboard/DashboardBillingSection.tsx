'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, FileText } from 'lucide-react'

type PaymentItem = {
  id: string
  amountInr: number
  currency: string
  plan: string
  status: string
  razorpayPaymentId: string
  createdAt: string
}

export function DashboardBillingSection() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/payments')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (!cancelled) setPayments(data.payments ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="dash-card">
      <div className="dash-card-header flex items-center gap-2">
        <CreditCard className="size-4 text-gray-500" aria-hidden />
        <p className="text-sm font-semibold text-gray-900">Billing history</p>
      </div>
      <div className="dash-card-body">
        {loading ? (
          <p className="text-sm text-gray-500">Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-600">
            No payments yet —{' '}
            <Link href="/dashboard/plans" className="font-medium text-[#ff4500] hover:underline">
              Upgrade to Pro
            </Link>{' '}
            to unlock unlimited roasts.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{p.amountInr.toLocaleString('en-IN')} — Pro Plan
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    <span className="capitalize text-emerald-600">{p.status}</span>
                  </p>
                </div>
                <Link
                  href={`/dashboard/billing/receipt/${p.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff4500] hover:underline"
                >
                  <FileText className="size-3.5" aria-hidden />
                  View receipt
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function DashboardBillingReceiptLink({ className }: { className?: string }) {
  const [latestId, setLatestId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/payments')
        if (!res.ok) return
        const data = await res.json()
        const first = (data.payments as PaymentItem[] | undefined)?.[0]
        if (first) setLatestId(first.id)
      } catch {
        /* ignore */
      }
    })()
  }, [])

  if (!latestId) return null

  return (
    <Link
      href={`/dashboard/billing/receipt/${latestId}`}
      className={className ?? 'inline-flex items-center gap-1.5 text-sm font-medium text-[#ff4500] hover:underline'}
    >
      <FileText className="size-4" aria-hidden />
      Download receipt
    </Link>
  )
}
