'use client'

import Link from 'next/link'
import { Bell, Globe, Lock } from 'lucide-react'
import { FREE_LIMIT } from '@/lib/usage'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DashboardBillingSection } from '@/components/dashboard/DashboardBillingSection'
import { DashboardDeleteAccountSection } from '@/components/dashboard/DashboardDeleteAccountSection'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'

function securityCopy(provider: string): { lead: string; foot?: string } {
  if (provider === 'google') {
    return {
      lead: 'You signed in with Google. Password changes are managed through your Google account.',
      foot: 'To revoke access, remove MyCVRoast from your Google account connected apps.',
    }
  }
  if (provider === 'github') {
    return {
      lead: 'You signed in with GitHub. Password changes are managed through your GitHub account.',
    }
  }
  return {
    lead: 'You signed in with email and password. Use the reset flow on the login page if you need a new password.',
    foot: 'Forgot your password? Request a reset link from the login page.',
  }
}

export function DashboardSettingsPanel() {
  const { authProvider } = useDashboardUser()
  const security = securityCopy(authProvider)

  return (
    <>
      <DashboardPageHeader
        title="Settings"
        description="Manage preferences for your MyCVRoast account."
      />

      <div className="space-y-5 max-w-2xl">
        <DashboardBillingSection />

        <div className="dash-card">
          <div className="dash-card-header flex items-center gap-2">
            <Lock className="size-4 text-gray-500" aria-hidden />
            <p className="text-sm font-semibold text-gray-900">Security</p>
          </div>
          <div className="dash-card-body space-y-4 text-sm text-gray-600">
            <p>{security.lead}</p>
            {security.foot && <p className="text-xs text-gray-400">{security.foot}</p>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header flex items-center gap-2">
            <Bell className="size-4 text-gray-500" aria-hidden />
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
          </div>
          <div className="dash-card-body">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-700">Product updates & tips</span>
              <input type="checkbox" defaultChecked className="size-4 rounded border-gray-300" />
            </label>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header flex items-center gap-2">
            <Globe className="size-4 text-gray-500" aria-hidden />
            <p className="text-sm font-semibold text-gray-900">Public site</p>
          </div>
          <div className="dash-card-body text-sm text-gray-600">
            <p>
              Anonymous visitors can roast on the{' '}
              <Link href="/" className="font-medium text-[#ff4500] hover:underline">
                public homepage
              </Link>{' '}
              without signing in ({FREE_LIMIT} free roasts per device). Your dashboard usage is separate and tied to this account.
            </p>
          </div>
        </div>

        <DashboardDeleteAccountSection />
      </div>
    </>
  )
}
