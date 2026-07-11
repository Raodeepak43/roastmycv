import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import {
  createJobApplication,
  listJobApplications,
  type ApplicationStatus,
} from '@/lib/dashboard/job-applications'

export const dynamic = 'force-dynamic'

const STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const applications = await listJobApplications(user.id)
    return NextResponse.json({ applications })
  } catch (err) {
    console.error('[applications GET]', err)
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { company, role, date_applied, status = 'applied', notes, job_url } = body as {
      company?: string
      role?: string
      date_applied?: string
      status?: ApplicationStatus
      notes?: string
      job_url?: string
    }

    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Company and role required' }, { status: 400 })
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const row = await createJobApplication(user.id, {
      company: company.trim(),
      role: role.trim(),
      date_applied: date_applied ?? new Date().toISOString().slice(0, 10),
      status,
      notes: notes?.trim(),
      job_url: job_url?.trim(),
    })

    if (!row) {
      return NextResponse.json({ error: 'Could not save — database unavailable' }, { status: 503 })
    }

    return NextResponse.json({ application: row })
  } catch (err) {
    console.error('[applications POST]', err)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
