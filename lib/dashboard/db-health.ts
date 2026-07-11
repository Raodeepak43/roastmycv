import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { pgDashboardTablesReady, pgTableExists } from '@/lib/db/post-migrate'

export interface DashboardDbStatus {
  /** Supabase REST API can query user_usage */
  apiReady: boolean
  /** Postgres has user_usage table (direct SQL) */
  pgReady: boolean
  /** Both ready — full dashboard DB features */
  ready: boolean
}

export async function isDashboardDbReady(): Promise<boolean> {
  const status = await getDashboardDbStatus()
  return status.ready
}

export async function getDashboardDbStatus(): Promise<DashboardDbStatus> {
  const pgReady = await pgTableExists('user_usage')
  if (!pgReady || !isSupabaseConfigured()) {
    return { apiReady: false, pgReady, ready: false }
  }

  try {
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('user_usage').select('user_id').limit(1)
    const apiReady = !error
    return { apiReady, pgReady, ready: apiReady && pgReady }
  } catch {
    return { apiReady: false, pgReady, ready: false }
  }
}

export async function areAllDashboardTablesInPg(): Promise<boolean> {
  return pgDashboardTablesReady()
}
