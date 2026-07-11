import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import {
  ensureUserUsage,
  getUserUsage,
} from '@/lib/dashboard/user-data'
import { USER_FREE_RESUME_AI, USER_FREE_RESUME_PDF } from '@/lib/dashboard/constants'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const kind = body.kind === 'ai' ? 'ai' : body.kind === 'pdf' ? 'pdf' : null
    if (!kind) {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
    }

    const usage = await getUserUsage(user.id)
    if (kind === 'pdf' && usage.plan !== 'pro' && usage.resumePdfLeft <= 0) {
      return NextResponse.json({ error: 'PDF limit reached' }, { status: 429 })
    }
    if (kind === 'ai' && usage.plan !== 'pro' && usage.resumeAiLeft <= 0) {
      return NextResponse.json({ error: 'AI limit reached' }, { status: 429 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const sb = getSupabaseAdmin()
    await ensureUserUsage(user.id)

    const field = kind === 'pdf' ? 'resume_pdf_used' : 'resume_ai_used'
    const current = kind === 'pdf' ? usage.resumePdfUsed : usage.resumeAiUsed

    await sb
      .from('user_usage')
      .update({
        [field]: current + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    const updated = await getUserUsage(user.id)
    return NextResponse.json({
      usage: updated,
      limits: {
        ai: USER_FREE_RESUME_AI,
        pdf: USER_FREE_RESUME_PDF,
      },
    })
  } catch (err) {
    console.error('[dashboard/resume-usage]', err)
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUserUsage(user.id)
    return NextResponse.json({
      usage,
      limits: {
        ai: USER_FREE_RESUME_AI,
        pdf: USER_FREE_RESUME_PDF,
      },
    })
  } catch (err) {
    console.error('[dashboard/resume-usage GET]', err)
    return NextResponse.json({ error: 'Failed to load usage' }, { status: 500 })
  }
}
