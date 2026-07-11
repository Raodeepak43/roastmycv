import { getPasswordResetCallbackUrl } from '@/lib/auth/redirects'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

/** Send Supabase password-reset email — never throws to caller */
export async function sendPasswordResetEmail(email: string, request?: Request): Promise<void> {
  if (!isSupabaseConfigured()) return

  try {
    const supabase = getSupabaseAdmin()
    const redirectTo = getPasswordResetCallbackUrl(request)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      console.warn('[auth/password-reset] send failed', { code: error.code ?? 'unknown' })
    }
  } catch (err) {
    console.warn('[auth/password-reset] unexpected error', err)
  }
}

/** @deprecated Use sendPasswordResetEmail */
export const sendLockoutResetEmail = sendPasswordResetEmail
