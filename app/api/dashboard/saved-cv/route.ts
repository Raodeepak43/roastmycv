import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getSavedDashboardCv, saveDashboardCv } from '@/lib/tools/dashboard/cv'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

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

    const saved = await getSavedDashboardCv(user.id)
    return NextResponse.json({
      cv: saved?.text ?? null,
      fileName: saved?.fileName ?? null,
      source: saved?.source ?? null,
      updatedAt: saved?.updatedAt ?? null,
      hasSavedCv: Boolean(saved?.text),
    })
  } catch (err) {
    console.error('[saved-cv GET]', err)
    return NextResponse.json({ error: 'Failed to load saved CV' }, { status: 500 })
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
    const cv = typeof body.cv === 'string' ? body.cv.trim() : ''
    if (cv.length < 50) {
      return NextResponse.json({ error: 'CV text too short' }, { status: 400 })
    }

    const fileName = typeof body.fileName === 'string' ? body.fileName : null
    const source = typeof body.source === 'string' ? body.source : 'upload'

    const ok = await saveDashboardCv(user.id, cv, { fileName, source })
    return NextResponse.json({ ok: true, persisted: ok })
  } catch (err) {
    console.error('[saved-cv POST]', err)
    return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabaseAdmin()
      await sb.from('user_saved_cv').delete().eq('user_id', user.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[saved-cv DELETE]', err)
    return NextResponse.json({ error: 'Failed to clear CV' }, { status: 500 })
  }
}
