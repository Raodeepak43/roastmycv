import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getToolResult } from '@/lib/dashboard/tool-results'

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

    const item = await getToolResult(user.id, params.id)
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[tool-results/id GET]', err)
    return NextResponse.json({ error: 'Failed to load result' }, { status: 500 })
  }
}
