'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronDown, Flame, PenLine, Zap } from 'lucide-react'
import { USER_FREE_ROASTS } from '@/lib/dashboard/constants'
import { FREE_LIMIT } from '@/lib/usage'
import { DASHBOARD_FREE_FEATURES, DASHBOARD_PRO_FEATURES, PRO_PRICE_INR } from '@/lib/plans'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { RazorpayProButton } from '@/components/RazorpayProButton'
import { DashboardBillingReceiptLink, DashboardBillingSection } from '@/components/dashboard/DashboardBillingSection'
import { markPageVisited } from '@/lib/dashboard/onboarding'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'

type FaqItem = {
  question: string
  answer: React.ReactNode
}

const PLANS_FAQ: FaqItem[] = [
  {
    question: 'What happens when I hit my free limit?',
    answer:
      "You'll see an upgrade prompt — your existing roasts and resume stay saved.",
  },
  {
    question: 'Is the ₹149 Pro plan really one-time?',
    answer:
      'Yes — pay once, unlimited roasts and PDF exports forever, no subscription.',
  },
  {
    question: 'Can I get a refund?',
    answer: (
      <>
        Refunds are handled case-by-case — email{' '}
        <a href={SUPPORT_MAILTO} className="font-medium text-[#ff4500] hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        within 7 days if something went wrong. See our{' '}
        <Link href="/terms" className="font-medium text-[#ff4500] hover:underline">
          Terms of Service
        </Link>{' '}
        for details.
      </>
    ),
  },
  {
    question: 'Does Pro work across devices?',
    answer: 'Yes — Pro is tied to your account, not your device.',
  },
]

const COMPACT_FAQ = [
  {
    q: 'Is this a one-time payment?',
    a: 'Yes, ₹149 forever. No subscription, no hidden fees.',
  },
  {
    q: 'What if I want a refund?',
    a: `Email ${SUPPORT_EMAIL} within 7 days for a full refund.`,
  },
  {
    q: 'Does Pro include future features?',
    a: 'Yes — all future Pro features are included.',
  },
] as const

export function DashboardPlansPanel() {
  const router = useRouter()
  const { userId } = useDashboardUser()
  const razorpayEnabled = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')

  useEffect(() => {
    if (userId) markPageVisited(userId, 'plans')
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/me')
        if (!res.ok) return
        const data = await res.json()
        setPlan(data.usage?.plan === 'pro' ? 'pro' : 'free')
      } catch {
        /* ignore */
      }
    })()
  }, [])
  return (
    <>
      <DashboardPageHeader
        title="Plans"
        description="Your dashboard usage is tied to your account — it persists across devices."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
        <div className="dash-card relative overflow-hidden ring-2 ring-[#ff4500]/30">
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[#fff4ed] px-2.5 py-1 text-xs font-semibold text-[#ff4500]">
              Current
            </span>
          </div>
          <div className="dash-card-body pt-8">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-[#ff4500]" aria-hidden />
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              ₹0<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3">
              {DASHBOARD_FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href="/dashboard/roast" className="dash-btn-primary flex-1 justify-center text-sm">
                <Flame className="size-4" aria-hidden />
                Roast CV
              </Link>
              <Link
                href="/dashboard/resume-builder"
                className="dash-btn-secondary flex-1 justify-center text-sm"
              >
                <PenLine className="size-4" aria-hidden />
                Builder
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            Trusted by 1,200+ job seekers · ₹{PRO_PRICE_INR} one-time, no subscription
          </p>
          <div className="dash-card opacity-90">
          <div className="dash-card-body">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              ₹{PRO_PRICE_INR}<span className="text-base font-normal text-gray-500"> one-time</span>
            </p>
            <ul className="mt-6 space-y-3">
              {DASHBOARD_PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-500" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            {razorpayEnabled ? (
              <RazorpayProButton
                className="mt-8 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                onSuccess={() => {
                  setPlan('pro')
                  router.refresh()
                }}
              >
                Pay ₹{PRO_PRICE_INR} — Unlock Pro
              </RazorpayProButton>
            ) : (
              <button
                type="button"
                disabled
                className="mt-8 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
              >
                Payment coming soon
              </button>
            )}
            {!razorpayEnabled && (
              <p className="mt-2 text-center text-xs text-gray-400">UPI / card payments coming soon</p>
            )}
            {plan === 'pro' && (
              <div className="mt-4 text-center">
                <DashboardBillingReceiptLink />
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-gray-400">
              {['UPI', 'Cards', 'Net Banking', 'Secure checkout'].map((label) => (
                <span key={label} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {plan === 'pro' && (
        <div className="mt-6">
          <DashboardBillingSection />
        </div>
      )}

      <div className="mt-6 dash-card">
        <div className="dash-card-header">
          <h2 className="text-sm font-semibold text-gray-900">Quick answers</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {COMPACT_FAQ.map(({ q, a }) => (
            <div key={q} className="px-5 py-4 sm:px-6">
              <p className="text-sm font-medium text-gray-900">{q}</p>
              <p className="mt-1 text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <strong className="text-gray-800">Website vs dashboard:</strong> The public site offers {FREE_LIMIT} anonymous roasts per
        device (no account). After signing in, your dashboard gives you a separate {USER_FREE_ROASTS}-roast allowance
        linked to your account, plus saved history.
      </div>

      <div className="mt-6 dash-card">
        <div className="dash-card-header">
          <h2 className="text-sm font-semibold text-gray-900">Frequently asked questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {PLANS_FAQ.map(({ question, answer }) => (
            <details key={question} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="size-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-3 pr-6 text-sm leading-relaxed text-gray-600">{answer}</div>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
