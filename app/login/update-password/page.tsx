import { Suspense } from 'react'
import { UpdatePasswordForm } from '@/components/auth/PasswordResetForms'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'

export default function UpdatePasswordPage() {
  const authConfigured = isSupabaseAuthConfigured()

  return (
    <Suspense fallback={<div className="auth-fuse-loading">Loading…</div>}>
      <UpdatePasswordForm authConfigured={authConfigured} />
    </Suspense>
  )
}
