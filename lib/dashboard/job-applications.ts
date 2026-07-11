import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'

export interface JobApplicationRow {
  id: string
  user_id: string
  company: string
  role: string
  date_applied: string
  status: ApplicationStatus
  notes: string | null
  job_url: string | null
  created_at: string
  updated_at: string
}

function admin() {
  if (!isSupabaseConfigured()) return null
  return getSupabaseAdmin()
}

export async function listJobApplications(userId: string): Promise<JobApplicationRow[]> {
  const sb = admin()
  if (!sb) return []

  const { data, error } = await sb
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('date_applied', { ascending: false })

  if (error) {
    console.error('[listJobApplications]', error.message)
    return []
  }
  return (data ?? []) as JobApplicationRow[]
}

export async function createJobApplication(
  userId: string,
  payload: {
    company: string
    role: string
    date_applied: string
    status: ApplicationStatus
    notes?: string
    job_url?: string
  },
): Promise<JobApplicationRow | null> {
  const sb = admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('job_applications')
    .insert({
      user_id: userId,
      company: payload.company,
      role: payload.role,
      date_applied: payload.date_applied,
      status: payload.status,
      notes: payload.notes ?? null,
      job_url: payload.job_url ?? null,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[createJobApplication]', error.message)
    return null
  }
  return data as JobApplicationRow
}

export async function updateJobApplication(
  userId: string,
  id: string,
  payload: Partial<{
    company: string
    role: string
    date_applied: string
    status: ApplicationStatus
    notes: string | null
    job_url: string | null
  }>,
): Promise<JobApplicationRow | null> {
  const sb = admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('job_applications')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('[updateJobApplication]', error.message)
    return null
  }
  return data as JobApplicationRow
}

export async function deleteJobApplication(userId: string, id: string): Promise<boolean> {
  const sb = admin()
  if (!sb) return false

  const { error } = await sb.from('job_applications').delete().eq('user_id', userId).eq('id', id)
  if (error) {
    console.error('[deleteJobApplication]', error.message)
    return false
  }
  return true
}

export function daysSince(dateStr: string): number {
  const applied = new Date(dateStr)
  const now = new Date()
  applied.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24))
}

export function needsFollowUp(row: JobApplicationRow): boolean {
  return row.status === 'applied' && daysSince(row.date_applied) >= 14
}
