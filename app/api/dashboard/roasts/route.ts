import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { listUserRoasts } from '@/lib/dashboard/user-data'
import { isDashboardDbReady } from '@/lib/dashboard/db-health'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roasts = await listUserRoasts(user.id, 50)
    const dbReady = await isDashboardDbReady()
    return NextResponse.json({ roasts, dbReady })
  } catch (err) {
    console.error('[dashboard/roasts]', err)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
}
