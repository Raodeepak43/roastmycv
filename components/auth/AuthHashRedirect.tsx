'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Redirect Supabase auth hash errors/tokens from homepage (Site URL) to login reset flow. */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return

    const params = new URLSearchParams(hash)
    const error = params.get('error')
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (error) {
      const dest = new URL('/login/forgot-password', window.location.origin)
      if (params.get('error_code') === 'otp_expired') {
        dest.searchParams.set('error', 'reset_expired')
      } else {
        dest.searchParams.set('error', 'auth')
      }
      window.location.replace(dest.toString())
      return
    }

    if (accessToken && type === 'recovery') {
      void (async () => {
        try {
          const supabase = createClient()
          await supabase.auth.getSession()
        } catch {
          // still navigate — update-password page will validate session
        }
        window.location.replace('/login/update-password')
      })()
    }
  }, [])

  return null
}
