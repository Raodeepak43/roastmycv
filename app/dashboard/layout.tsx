import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { NOINDEX_ROBOTS } from '@/lib/seo'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'
import { resolveAvatarUrl } from '@/lib/auth/avatar'
import { getRequestHost, isDashboardHost, isDashboardSubdomainRoutingEnabled } from '@/lib/site/hosts'
import './dashboard.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-dash',
})

export const metadata: Metadata = {
  title: 'Dashboard | MyCVRoast',
  robots: NOINDEX_ROBOTS,
}

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseAuthConfigured()) {
    redirect('/login?error=config')
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const host = getRequestHost({ headers: headers() })
    const next =
      isDashboardHost(host) && isDashboardSubdomainRoutingEnabled(host) ? '/' : '/dashboard'
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  const name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'User'
  const avatarUrl = resolveAvatarUrl(user.user_metadata as Record<string, unknown> | undefined)
  const authProvider =
    (typeof user.app_metadata?.provider === 'string' && user.app_metadata.provider) ||
    user.identities?.[0]?.provider ||
    'email'

  return (
    <div className={`dash-app w-full h-dvh overflow-hidden antialiased ${inter.variable}`}>
      <DashboardLayoutClient
        userId={user.id}
        name={name}
        email={user.email ?? ''}
        avatarUrl={avatarUrl}
        authProvider={authProvider}
      >
        {children}
      </DashboardLayoutClient>
    </div>
  )
}
