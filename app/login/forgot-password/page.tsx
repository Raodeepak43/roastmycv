import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/auth/PasswordResetForms'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'

export default function ForgotPasswordPage() {
  const authConfigured = isSupabaseAuthConfigured()

  return (
    <Suspense fallback={<div className="auth-fuse-loading">Loading…</div>}>
      <ForgotPasswordForm authConfigured={authConfigured} />
    </Suspense>
  )
}
