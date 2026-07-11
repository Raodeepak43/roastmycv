import { NextResponse } from 'next/server'
import { clearIdleSessionCookie, touchIdleSessionCookie } from '@/lib/auth/idle-session'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  try {
    const supabase = createRouteHandlerClient(response)
    await supabase.auth.signOut()
  } catch {
    /* still clear cookies */
  }
  clearIdleSessionCookie(response)
  return response
}
