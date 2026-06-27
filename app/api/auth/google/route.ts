import { NextResponse } from 'next/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function GET(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL('/login?error=config', request.url))
  }

  try {
    const origin = new URL(request.url).origin
    const supabase = createRouteHandlerClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
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
