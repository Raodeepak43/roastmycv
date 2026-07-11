import { NextResponse } from 'next/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getAuthCallbackUrl, safeRedirectPath } from '@/lib/auth/redirects'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL('/login?error=config', request.url))
  }

  try {
    const { searchParams } = new URL(request.url)
    const next = safeRedirectPath(searchParams.get('next'))
    const supabase = createRouteHandlerClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(request, next),
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })

    if (error || !data.url) {
      console.error('[auth/google]', error?.message ?? 'No OAuth URL')
      return NextResponse.redirect(new URL('/login?error=auth', request.url))
    }

    return NextResponse.redirect(data.url)
  } catch (err) {
    console.error('[auth/google]', err)
    return NextResponse.redirect(new URL('/login?error=config', request.url))
  }
}
