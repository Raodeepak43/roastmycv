import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { getStatsCount } from '@/lib/stats'
import { getAdminUserStats, type AdminUserStats } from '@/lib/admin/users'

export interface AdminOverview {
  roastCount: number
  emailSignups: number
  tickerSignups: number
  usageRows: number
  users: AdminUserStats
  recentEmails: { email: string; created_at: string }[]
  recentTicker: { name: string; score: number | null; language: string | null; created_at: string }[]
  topUsage: { fingerprint: string; used_count: number; paid?: boolean; updated_at: string }[]
  recentUsers: { email: string; plan: string; created_at: string }[]
  recentPayments: { email: string | null; amount_inr: number; created_at: string }[]
}

const emptyUserStats: AdminUserStats = {
  totalUsers: 0,
  proUsers: 0,
  freeUsers: 0,
  paidFingerprints: 0,
  totalPayments: 0,
  revenueInr: 0,
  totalRoastsSaved: 0,
  signupsLast7Days: 0,
}

const emptyOverview: AdminOverview = {
  roastCount: 0,
  emailSignups: 0,
  tickerSignups: 0,
  usageRows: 0,
  users: emptyUserStats,
  recentEmails: [],
  recentTicker: [],
  topUsage: [],
  recentUsers: [],
  recentPayments: [],
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const roastCount = await getStatsCount()
  const users = await getAdminUserStats()

  if (!isSupabaseConfigured()) {
    return { ...emptyOverview, roastCount, users }
  }

  try {
    const supabase = getSupabaseAdmin()

    const [emailsRes, tickerRes, usageCountRes, usageTopRes, emailCountRes, tickerCountRes, paymentsRes, authRes] =
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
          .select('fingerprint, used_count, paid, updated_at')
          .order('used_count', { ascending: false })
          .limit(10),
        supabase.from('email_signups').select('*', { count: 'exact', head: true }),
        supabase.from('roast_signups').select('*', { count: 'exact', head: true }),
        supabase
          .from('user_payments')
          .select('user_id, amount_inr, created_at')
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.auth.admin.listUsers({ page: 1, perPage: 20 }),
      ])

    const authUsers = authRes.data?.users ?? []
    const usageRows = await supabase.from('user_usage').select('user_id, plan')
    const planMap = new Map((usageRows.data ?? []).map((r) => [r.user_id, r.plan]))

    const recentUsers = authUsers
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 8)
      .map((u) => ({
        email: u.email ?? '—',
        plan: (planMap.get(u.id) as string) ?? 'free',
        created_at: u.created_at ?? '',
      }))

    const paymentUserIds = Array.from(new Set((paymentsRes.data ?? []).map((p) => p.user_id)))
    const emailMap = new Map<string, string>()
    await Promise.all(
      paymentUserIds.map(async (id) => {
        const { data } = await supabase.auth.admin.getUserById(id)
        if (data?.user?.email) emailMap.set(id, data.user.email)
      }),
    )

    const recentPayments = (paymentsRes.data ?? []).map((p) => ({
      email: emailMap.get(p.user_id) ?? null,
      amount_inr: p.amount_inr,
      created_at: p.created_at,
    }))

    return {
      roastCount,
      emailSignups: emailCountRes.count ?? 0,
      tickerSignups: tickerCountRes.count ?? 0,
      usageRows: usageCountRes.count ?? 0,
      users,
      recentEmails: (emailsRes.data ?? []) as AdminOverview['recentEmails'],
      recentTicker: (tickerRes.data ?? []) as AdminOverview['recentTicker'],
      topUsage: (usageTopRes.data ?? []) as AdminOverview['topUsage'],
      recentUsers,
      recentPayments,
    }
  } catch (err) {
    console.error('admin overview:', err)
    return { ...emptyOverview, roastCount, users }
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
    .select('fingerprint, used_count, paid, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
