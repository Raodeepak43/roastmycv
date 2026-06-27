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

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const email = body.email?.trim()
  const password = body.password
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/signin]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
