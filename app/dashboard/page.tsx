import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { UserDashboard } from '@/components/dashboard/UserDashboard'

export const metadata = {
  title: 'Dashboard | MyCVRoast',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect('/login?error=config')
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'User'

  return <UserDashboard email={user.email ?? ''} name={name} />
}
