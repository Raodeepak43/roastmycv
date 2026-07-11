'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, Mail, Calendar, Shield, Pencil } from 'lucide-react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { DashboardUserAvatar } from '@/components/dashboard/DashboardUserAvatar'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DashboardBillingReceiptLink } from '@/components/dashboard/DashboardBillingSection'
import { DashboardDeleteAccountSection } from '@/components/dashboard/DashboardDeleteAccountSection'

export function DashboardProfilePanel() {
  const ctx = useDashboardUser()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState(ctx.name)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [plan, setPlan] = useState('free')
  const [hasDisplayName, setHasDisplayName] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDisplayName(ctx.name)
  }, [ctx.name])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/me', { cache: 'no-store', credentials: 'include' })
        if (res.status === 401) {
          window.location.href = '/login?reason=session_expired'
          return
        }
        if (!res.ok) return
        const data = await res.json()
        setCreatedAt(data.user?.createdAt ?? null)
        setPlan(data.usage?.plan ?? 'free')
        setHasDisplayName(data.user?.hasDisplayName ?? true)
        if (!data.user?.hasDisplayName) setEditingName(true)
      } catch {
        /* ignore */
      }
    })()
  }, [])

  useEffect(() => {
    if (!hasDisplayName && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [hasDisplayName])

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—'

  const canSave = displayName.trim().length > 0 && displayName.trim() !== ctx.name && !saving

  const handleSave = async () => {
    const trimmed = displayName.trim()
    if (!trimmed || trimmed === ctx.name) return

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/dashboard/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')

      ctx.setName(data.name)
      setDisplayName(data.name)
      setHasDisplayName(true)
      setEditingName(false)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DashboardPageHeader
        title="Profile"
        description="Your account details and membership info."
      />

      <div className="grid grid-cols-12 gap-5 lg:gap-6">
        <div className="col-span-12 md:col-span-8">
          <div className="dash-card">
            <div className="dash-card-body space-y-6">
              <div className="flex items-center gap-4">
                <DashboardUserAvatar
                  name={ctx.name}
                  email={ctx.email}
                  avatarUrl={ctx.avatarUrl}
                  size="lg"
                />
                <div>
                  <p className="text-xl font-semibold text-gray-900">{ctx.name}</p>
                  <p className="text-sm text-gray-500">{ctx.email}</p>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:col-span-2">
                  {!hasDisplayName && (
                    <p className="mb-3 rounded-lg border border-[#ff4500]/20 bg-[#fff4ed] px-3 py-2 text-sm text-[#c2410c]">
                      Add your name to personalize your dashboard
                    </p>
                  )}
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <User className="size-3.5" aria-hidden />
                    Display name
                  </dt>
                  <dd className="mt-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <Pencil
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                          aria-hidden
                        />
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          maxLength={100}
                          autoComplete="name"
                          aria-label="Display name"
                          readOnly={!editingName && hasDisplayName}
                          className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 ${
                            !hasDisplayName || editingName
                              ? 'border-[#ff4500] ring-2 ring-[#ff4500]/20 focus:border-[#ff4500] focus:ring-[#ff4500]/30'
                              : 'border-gray-200 bg-gray-50 focus:border-[#ff4500] focus:ring-[#ff4500]/20'
                          } ${!editingName && hasDisplayName ? 'cursor-default' : ''}`}
                        />
                      </div>
                      {!editingName && hasDisplayName ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingName(true)
                            window.setTimeout(() => nameInputRef.current?.focus(), 0)
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleSave()}
                          disabled={!canSave}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#ff4500] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      )}
                    </div>
                    {saved && (
                      <p className="mt-2 text-sm font-medium text-emerald-600" role="status">
                        Saved ✓
                      </p>
                    )}
                    {error && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    )}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Mail className="size-3.5" aria-hidden />
                    Email
                  </dt>
                  <dd className="mt-2 break-all font-medium text-gray-900">{ctx.email}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Calendar className="size-3.5" aria-hidden />
                    Member since
                  </dt>
                  <dd className="mt-2 font-medium text-gray-900">{memberSince}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Shield className="size-3.5" aria-hidden />
                    Plan
                  </dt>
                  <dd className="mt-2 font-medium capitalize text-emerald-600">{plan}</dd>
                  {plan === 'pro' && (
                    <dd className="mt-3">
                      <DashboardBillingReceiptLink />
                    </dd>
                  )}
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-5">
          <div className="dash-card p-5">
            <p className="text-sm font-semibold text-gray-900">Quick links</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/dashboard/settings" className="text-gray-600 hover:text-[#ff4500]">
                  Account settings →
                </Link>
              </li>
              <li>
                <Link href="/dashboard/plans" className="text-gray-600 hover:text-[#ff4500]">
                  View plans →
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="text-gray-600 hover:text-[#ff4500]">
                  Roast history →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <DashboardDeleteAccountSection />
      </div>
    </>
  )
}
