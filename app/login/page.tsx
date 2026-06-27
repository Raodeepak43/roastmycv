import { Suspense } from 'react'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { AuthUI } from '@/components/ui/auth-fuse'

function LoginClient({ authConfigured }: { authConfigured: boolean }) {
  return <AuthUI authConfigured={authConfigured} />
}

export default function LoginPage() {
  const authConfigured = isSupabaseAuthConfigured()

  return (
    <Suspense fallback={<div className="auth-fuse-loading">Loading…</div>}>
      <LoginClient authConfigured={authConfigured} />
    </Suspense>
  )
}
