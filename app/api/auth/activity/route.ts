import { NextResponse } from 'next/server'
import { clearIdleSessionCookie, touchIdleSessionCookie } from '@/lib/auth/idle-session'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  try {
    const supabase = createRouteHandlerClient(response)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    touchIdleSessionCookie(response)
    return response
  } catch {
    return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  clearIdleSessionCookie(response)
  return response
}
