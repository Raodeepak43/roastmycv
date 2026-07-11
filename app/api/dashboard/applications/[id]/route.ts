import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import {
  deleteJobApplication,
  updateJobApplication,
  type ApplicationStatus,
} from '@/lib/dashboard/job-applications'

export const dynamic = 'force-dynamic'

const STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const payload: Record<string, unknown> = {}
    if (typeof body.company === 'string') payload.company = body.company.trim()
    if (typeof body.role === 'string') payload.role = body.role.trim()
    if (typeof body.date_applied === 'string') payload.date_applied = body.date_applied
    if (typeof body.status === 'string' && STATUSES.includes(body.status)) payload.status = body.status
    if (body.notes !== undefined) payload.notes = body.notes ? String(body.notes).trim() : null
    if (body.job_url !== undefined) payload.job_url = body.job_url ? String(body.job_url).trim() : null

    const row = await updateJobApplication(user.id, params.id, payload)
    if (!row) return NextResponse.json({ error: 'Not found or update failed' }, { status: 404 })

    return NextResponse.json({ application: row })
  } catch (err) {
    console.error('[applications PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ok = await deleteJobApplication(user.id, params.id)
    if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[applications DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
