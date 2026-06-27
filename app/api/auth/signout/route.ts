import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient()
    await supabase.auth.signOut()
  } catch {
    /* still clear client-side session cookie if possible */
  }
  return NextResponse.json({ ok: true })
}
