import { Suspense } from 'react'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { AuthUI } from '@/components/ui/auth-fuse'
import { LoginProviders } from './LoginProviders'

function LoginClient({ authConfigured }: { authConfigured: boolean }) {
  return <AuthUI authConfigured={authConfigured} />
}

export default function LoginPage() {
  const authConfigured = isSupabaseAuthConfigured()

  return (
    <LoginProviders>
      <Suspense fallback={<div className="auth-fuse-loading">Loading…</div>}>
        <LoginClient authConfigured={authConfigured} />
      </Suspense>
    </LoginProviders>
  )
}
