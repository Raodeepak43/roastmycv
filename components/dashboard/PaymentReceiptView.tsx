'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, Printer } from 'lucide-react'
import { PRO_PLAN_LABEL } from '@/lib/dashboard/payments'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'

type ReceiptData = {
  payment: {
    id: string
    amountInr: number
    currency: string
    plan: string
    status: string
    razorpayOrderId: string
    razorpayPaymentId: string
    createdAt: string
  }
  user: {
    email: string
    name: string
  }
}

export function PaymentReceiptView({ paymentId }: { paymentId: string }) {
  const [data, setData] = useState<ReceiptData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/dashboard/payments/${paymentId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed to load receipt')
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load receipt')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [paymentId])

  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-500">Loading receipt…</p>
  }

  if (error || !data) {
    return (
      <div className="dash-card dash-card-body py-16 text-center">
        <p className="text-sm text-gray-600">{error || 'Receipt not found'}</p>
        <Link href="/dashboard/settings" className="mt-4 inline-block text-sm font-medium text-[#ff4500] hover:underline">
          Back to billing
        </Link>
      </div>
    )
  }

  const { payment, user } = data
  const paidAt = new Date(payment.createdAt).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <div className="receipt-page mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-600 hover:text-[#ff4500]">
          ← Back to billing
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Printer className="size-4" aria-hidden />
          Print / Save as PDF
        </button>
      </div>

      <article className="receipt-sheet dash-card overflow-hidden">
        <div className="border-b border-gray-100 bg-[#fff4ed] px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#ff4500] shadow-sm">
              <Flame className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MyCVRoast</h1>
              <p className="text-xs text-gray-500">Payment receipt</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8 text-sm text-gray-700">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Billed to</p>
              <p className="mt-1 font-semibold text-gray-900">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receipt date</p>
              <p className="mt-1 font-medium text-gray-900">{paidAt}</p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 pr-4">
                  <p className="font-semibold text-gray-900">{PRO_PLAN_LABEL}</p>
                  <p className="mt-1 text-xs text-gray-500">Unlimited roasts & PDF exports</p>
                </td>
                <td className="py-4 text-right font-semibold text-gray-900">
                  ₹{payment.amountInr.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 text-right font-semibold text-gray-900">Total paid</td>
                <td className="pt-4 text-right text-lg font-bold text-[#ff4500]">
                  ₹{payment.amountInr.toLocaleString('en-IN')} {payment.currency}
                </td>
              </tr>
            </tfoot>
          </table>

          <dl className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Payment ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-gray-800">{payment.razorpayPaymentId}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-gray-800">{payment.razorpayOrderId}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</dt>
              <dd className="mt-1 font-medium capitalize text-emerald-600">{payment.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Plan</dt>
              <dd className="mt-1 font-medium text-gray-900">{PRO_PLAN_LABEL}</dd>
            </div>
          </dl>

          <p className="text-xs leading-relaxed text-gray-400">
            Thank you for upgrading to MyCVRoast Pro. For billing questions, contact{' '}
            <a href={SUPPORT_MAILTO} className="text-[#ff4500] hover:underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      </article>

      <style jsx global>{`
        @media print {
          .dash-app aside,
          .dash-app > div > header {
            display: none !important;
          }
          .receipt-page {
            max-width: none;
            padding: 0;
          }
          .receipt-sheet {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}
