'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { DashboardUserProvider } from '@/components/dashboard/DashboardUserContext'
import { DashboardDataProvider } from '@/components/dashboard/DashboardDataProvider'
import { DashboardCvProvider } from '@/components/dashboard/DashboardCvProvider'
import { SessionIdleGuard } from '@/components/auth/SessionIdleGuard'
import { clearUserSiteStorage } from '@/lib/client-storage/cleanup'
import { stopInterviewSpeech } from '@/lib/tools/dashboard/interview-speech'

interface DashboardLayoutClientProps {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  authProvider: string
  children: React.ReactNode
}

export function DashboardLayoutClient({
  userId,
  name,
  email,
  avatarUrl,
  authProvider,
  children,
}: DashboardLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    return () => {
      stopInterviewSpeech()
    }
  }, [pathname])

  const signOut = async () => {
    stopInterviewSpeech()
    clearUserSiteStorage(userId)
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  return (
    <DashboardUserProvider
      userId={userId}
      name={name}
      email={email}
      avatarUrl={avatarUrl}
      authProvider={authProvider}
    >
      <SessionIdleGuard onSignOut={signOut} />
      <DashboardDataProvider>
        <DashboardCvProvider>
          <DashboardShell email={email} onSignOut={signOut}>
            {children}
          </DashboardShell>
        </DashboardCvProvider>
      </DashboardDataProvider>
    </DashboardUserProvider>
  )
}
