import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getUserRoast } from '@/lib/dashboard/user-data'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roast = await getUserRoast(user.id, params.id)
    if (!roast) {
      return NextResponse.json({ error: 'Roast not found' }, { status: 404 })
    }

    return NextResponse.json({ roast })
  } catch (err) {
    console.error('[dashboard/roasts/id]', err)
    return NextResponse.json({ error: 'Failed to load roast' }, { status: 500 })
  }
}
