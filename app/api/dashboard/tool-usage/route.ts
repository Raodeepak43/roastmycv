import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getToolUsageCount } from '@/lib/tools/dashboard/usage'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { TOOL_ACCESS } from '@/lib/tools/dashboard/config'
import { getUserUsage } from '@/lib/dashboard/user-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slug = req.nextUrl.searchParams.get('slug') as ToolSlug | null
    if (!slug || !TOOL_ACCESS[slug]) {
      return NextResponse.json({ error: 'Invalid tool' }, { status: 400 })
    }

    const usage = await getUserUsage(user.id)
    const used = await getToolUsageCount(user.id, slug)
    const access = TOOL_ACCESS[slug]
    const isPro = usage.plan === 'pro'

    return NextResponse.json({
      used,
      limit: isPro ? 999 : access.freeLimit,
      isPro,
      proOnly: access.proOnly,
    })
  } catch (err) {
    console.error('[tool-usage GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
