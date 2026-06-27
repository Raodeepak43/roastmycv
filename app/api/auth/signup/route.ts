import { NextResponse } from 'next/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: 'Auth not configured — add SUPABASE_ANON_KEY to .env.local' },
      { status: 503 },
    )
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const email = body.email?.trim()
  const password = body.password
  const name = body.name?.trim()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  try {
    const origin = new URL(request.url).origin
    const supabase = createRouteHandlerClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { full_name: name } : undefined,
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      needsEmailConfirm: !data.session,
    })
  } catch (err) {
    console.error('[auth/signup]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
