import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { getStatsCount } from '@/lib/stats'

export interface AdminOverview {
  roastCount: number
  emailSignups: number
  tickerSignups: number
  usageRows: number
  recentEmails: { email: string; created_at: string }[]
  recentTicker: { name: string; score: number | null; language: string | null; created_at: string }[]
  topUsage: { fingerprint: string; used_count: number; updated_at: string }[]
}

const emptyOverview: AdminOverview = {
  roastCount: 0,
  emailSignups: 0,
  tickerSignups: 0,
  usageRows: 0,
  recentEmails: [],
  recentTicker: [],
  topUsage: [],
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const roastCount = await getStatsCount()

  if (!isSupabaseConfigured()) {
    return { ...emptyOverview, roastCount }
  }

  try {
    const supabase = getSupabaseAdmin()

    const [emailsRes, tickerRes, usageCountRes, usageTopRes, emailCountRes, tickerCountRes] =
      await Promise.all([
        supabase
          .from('email_signups')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('roast_signups')
          .select('name, score, language, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('usage_limits').select('*', { count: 'exact', head: true }),
        supabase
          .from('usage_limits')
          .select('fingerprint, used_count, updated_at')
          .order('used_count', { ascending: false })
          .limit(10),
        supabase.from('email_signups').select('*', { count: 'exact', head: true }),
        supabase.from('roast_signups').select('*', { count: 'exact', head: true }),
      ])

    return {
      roastCount,
      emailSignups: emailCountRes.count ?? 0,
      tickerSignups: tickerCountRes.count ?? 0,
      usageRows: usageCountRes.count ?? 0,
      recentEmails: (emailsRes.data ?? []) as AdminOverview['recentEmails'],
      recentTicker: (tickerRes.data ?? []) as AdminOverview['recentTicker'],
      topUsage: (usageTopRes.data ?? []) as AdminOverview['topUsage'],
    }
  } catch (err) {
    console.error('admin overview:', err)
    return { ...emptyOverview, roastCount }
  }
}

export async function getAllEmails(limit = 100) {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('email_signups')
    .select('email, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getAllTickerSignups(limit = 100) {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('roast_signups')
    .select('name, score, language, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getAllUsage(limit = 100) {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('usage_limits')
    .select('fingerprint, used_count, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
