import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getToolResult, listAllToolResultsForUser, listToolResults, saveToolResult } from '@/lib/dashboard/tool-results'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { TOOL_ACCESS } from '@/lib/tools/dashboard/config'

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

    const slug = req.nextUrl.searchParams.get('slug')
    const all = req.nextUrl.searchParams.get('all') === '1'
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 20), 50)

    if (all) {
      const items = await listAllToolResultsForUser(user.id, limit)
      return NextResponse.json({ items })
    }

    if (slug && slug in TOOL_ACCESS) {
      const items = await listToolResults(user.id, { toolSlug: slug as ToolSlug, limit })
      return NextResponse.json({ items })
    }

    const items = await listToolResults(user.id, { limit })
    return NextResponse.json({ items })
  } catch (err) {
    console.error('[tool-results GET]', err)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const slug = body.slug as ToolSlug
    const resultText = typeof body.resultText === 'string' ? body.resultText.trim() : ''
    const inputSummary = typeof body.inputSummary === 'string' ? body.inputSummary.trim() : undefined
    const title = typeof body.title === 'string' ? body.title.trim() : undefined
    const resultData =
      body.resultData && typeof body.resultData === 'object' && !Array.isArray(body.resultData)
        ? (body.resultData as Record<string, unknown>)
        : undefined

    if (!slug || !(slug in TOOL_ACCESS)) {
      return NextResponse.json({ error: 'Invalid tool' }, { status: 400 })
    }
    if (resultText.length < 20) {
      return NextResponse.json({ error: 'Result too short' }, { status: 400 })
    }

    const row = await saveToolResult({
      userId: user.id,
      toolSlug: slug,
      resultText,
      inputSummary,
      title,
      resultData,
    })

    if (!row) {
      return NextResponse.json({ error: 'Could not save result' }, { status: 500 })
    }

    return NextResponse.json({ item: row })
  } catch (err) {
    console.error('[tool-results POST]', err)
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }
}
