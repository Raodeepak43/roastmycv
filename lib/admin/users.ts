import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { PRO_PRICE_INR } from '@/lib/plans'
import { ensureDashboardTables } from '@/lib/dashboard/ensure-tables'
import { setUserPlan } from '@/lib/dashboard/user-data'
import { recordUserPayment } from '@/lib/dashboard/payments'
import type { UserPlan } from '@/lib/dashboard/constants'
import { listPaymentsPg } from '@/lib/dashboard/payments-pg'
import { listRazorpayCapturedPayments } from '@/lib/razorpay/list-payments'
import { isRazorpayConfigured } from '@/lib/razorpay/config'
import { syncRazorpayPaymentsToDb } from '@/lib/admin/payments-sync'

export interface AdminUserStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  paidFingerprints: number
  totalPayments: number
  revenueInr: number
  totalRoastsSaved: number
  signupsLast7Days: number
}

export interface AdminUserRow {
  id: string
  email: string
  name: string | null
  plan: 'free' | 'pro'
  roastsUsed: number
  resumeAiUsed: number
  resumePdfUsed: number
  savedRoasts: number
  paymentsCount: number
  totalPaidInr: number
  createdAt: string
  lastActive: string | null
  provider: string | null
}

export interface AdminPaymentRow {
  id: string
  userId: string
  email: string | null
  razorpayPaymentId: string
  amountInr: number
  plan: string
  status: string
  createdAt: string
  source: 'db' | 'razorpay'
}

const emptyStats: AdminUserStats = {
  totalUsers: 0,
  proUsers: 0,
  freeUsers: 0,
  paidFingerprints: 0,
  totalPayments: 0,
  revenueInr: 0,
  totalRoastsSaved: 0,
  signupsLast7Days: 0,
}

function displayName(meta: Record<string, unknown> | undefined, email: string): string | null {
  const full = typeof meta?.full_name === 'string' ? meta.full_name.trim() : ''
  if (full) return full
  return email.split('@')[0] || null
}

async function loadPaidPaymentRows() {
  const sb = isSupabaseConfigured() ? getSupabaseAdmin() : null
  if (sb) {
    const { data, error } = await sb
      .from('user_payments')
      .select('user_id, amount_inr, status')
      .eq('status', 'paid')
    if (!error && data?.length) return data
  }
  const pgRows = await listPaymentsPg(500)
  return pgRows.filter((r) => r.status === 'paid').map((r) => ({
    user_id: r.user_id,
    amount_inr: r.amount_inr,
    status: r.status,
  }))
}

function authProvider(user: { app_metadata?: Record<string, unknown> }): string | null {
  const provider = user.app_metadata?.provider
  return typeof provider === 'string' ? provider : null
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  if (!isSupabaseConfigured()) return emptyStats

  try {
    const sb = getSupabaseAdmin()

    const [authRes, usageRes, roastsCountRes, paidFpRes] = await Promise.all([
      sb.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      sb.from('user_usage').select('user_id, plan'),
      sb.from('user_roasts').select('*', { count: 'exact', head: true }),
      sb.from('usage_limits').select('*', { count: 'exact', head: true }).eq('paid', true),
    ])

    const paymentRows = await loadPaidPaymentRows()
    let payments = paymentRows
    if (payments.length === 0 && isRazorpayConfigured()) {
      const live = await listRazorpayCapturedPayments(100)
      payments = live
        .filter((p) => p.userId)
        .map((p) => ({ user_id: p.userId!, amount_inr: p.amountInr, status: 'paid' as const }))
    }
    const revenueInr = payments.reduce((sum, p) => sum + (p.amount_inr ?? PRO_PRICE_INR), 0)

    const users = authRes.data?.users ?? []
    const usageRows = usageRes.data ?? []
    const proFromUsage = usageRows.filter((r) => r.plan === 'pro').length
    const proFromMeta = users.filter((u) => u.app_metadata?.plan === 'pro').length
    const proUsers = Math.max(proFromUsage, proFromMeta, 0)

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const signupsLast7Days = users.filter(
      (u) => u.created_at && new Date(u.created_at).getTime() >= weekAgo,
    ).length

    const totalUsers = users.length
    const freeUsers = Math.max(0, totalUsers - proUsers)

    return {
      totalUsers,
      proUsers,
      freeUsers,
      paidFingerprints: paidFpRes.count ?? 0,
      totalPayments: payments.length,
      revenueInr,
      totalRoastsSaved: roastsCountRes.count ?? 0,
      signupsLast7Days,
    }
  } catch (err) {
    console.error('[admin/users] stats', err)
    return emptyStats
  }
}

export async function getAdminUsers(limit = 200): Promise<AdminUserRow[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const sb = getSupabaseAdmin()

    const { data: authData } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const authUsers = authData?.users ?? []
    if (authUsers.length === 0) return []

    const ids = authUsers.map((u) => u.id)

    const paymentRows = await loadPaidPaymentRows()
    let paymentData = paymentRows
    if (paymentData.length === 0 && isRazorpayConfigured()) {
      const live = await listRazorpayCapturedPayments(100)
      paymentData = live
        .filter((p) => p.userId)
        .map((p) => ({ user_id: p.userId!, amount_inr: p.amountInr, status: 'paid' as const }))
    }

    const [usageRes, roastCountsRes] = await Promise.all([
      sb.from('user_usage').select('user_id, plan, roasts_used, resume_ai_used, resume_pdf_used, updated_at'),
      sb.from('user_roasts').select('user_id'),
    ])

    const usageMap = new Map(
      (usageRes.data ?? []).map((r) => [
        r.user_id,
        {
          plan: r.plan as 'free' | 'pro',
          roastsUsed: r.roasts_used ?? 0,
          resumeAiUsed: r.resume_ai_used ?? 0,
          resumePdfUsed: r.resume_pdf_used ?? 0,
          updatedAt: r.updated_at as string,
        },
      ]),
    )

    const paymentMap = new Map<string, { count: number; total: number }>()
    for (const p of paymentData) {
      const cur = paymentMap.get(p.user_id) ?? { count: 0, total: 0 }
      cur.count += 1
      cur.total += p.amount_inr ?? PRO_PRICE_INR
      paymentMap.set(p.user_id, cur)
    }

    const roastCountMap = new Map<string, number>()
    for (const r of roastCountsRes.data ?? []) {
      roastCountMap.set(r.user_id, (roastCountMap.get(r.user_id) ?? 0) + 1)
    }

    const rows: AdminUserRow[] = authUsers.map((u) => {
      const usage = usageMap.get(u.id)
      const pay = paymentMap.get(u.id)
      const metaPlan = u.app_metadata?.plan === 'pro' ? 'pro' : null
      const plan = usage?.plan === 'pro' || metaPlan === 'pro' ? 'pro' : 'free'
      return {
        id: u.id,
        email: u.email ?? '—',
        name: displayName(u.user_metadata as Record<string, unknown>, u.email ?? ''),
        plan,
        roastsUsed: usage?.roastsUsed ?? 0,
        resumeAiUsed: usage?.resumeAiUsed ?? 0,
        resumePdfUsed: usage?.resumePdfUsed ?? 0,
        savedRoasts: roastCountMap.get(u.id) ?? 0,
        paymentsCount: pay?.count ?? 0,
        totalPaidInr: pay?.total ?? 0,
        createdAt: u.created_at ?? new Date().toISOString(),
        lastActive: usage?.updatedAt ?? u.last_sign_in_at ?? null,
        provider: authProvider(u),
      }
    })

    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return rows.slice(0, limit)
  } catch (err) {
    console.error('[admin/users] list', err)
    return []
  }
}

async function fetchDbPaymentRows(limit: number): Promise<AdminPaymentRow[]> {
  const sb = isSupabaseConfigured() ? getSupabaseAdmin() : null
  type PayRow = {
    id: string
    user_id: string
    razorpay_payment_id: string
    amount_inr: number
    plan: string
    status: string
    created_at: string
  }
  let payments: PayRow[] = []

  if (sb) {
    const { data, error } = await sb
      .from('user_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (!error && data?.length) payments = data as PayRow[]
  }

  if (payments.length === 0) {
    payments = (await listPaymentsPg(limit)) as PayRow[]
  }

  if (!payments.length) return []

  const emailMap = new Map<string, string>()
  if (sb) {
    const userIds = Array.from(new Set(payments.map((p) => p.user_id)))
    await Promise.all(
      userIds.map(async (id) => {
        const { data } = await sb.auth.admin.getUserById(id)
        if (data?.user?.email) emailMap.set(id, data.user.email)
      }),
    )
  }

  return payments.map((p) => ({
    id: p.id,
    userId: p.user_id,
    email: emailMap.get(p.user_id) ?? null,
    razorpayPaymentId: p.razorpay_payment_id,
    amountInr: p.amount_inr,
    plan: p.plan,
    status: p.status,
    createdAt: p.created_at,
    source: 'db' as const,
  }))
}

export async function getAdminPayments(limit = 100): Promise<AdminPaymentRow[]> {
  if (!isSupabaseConfigured() && !isRazorpayConfigured()) return []

  try {
    let dbRows = await fetchDbPaymentRows(limit)
    if (dbRows.length === 0) {
      await syncRazorpayPaymentsToDb()
      dbRows = await fetchDbPaymentRows(limit)
    }

    const seenIds = new Set(dbRows.map((r) => r.razorpayPaymentId))

    if (isRazorpayConfigured()) {
      const live = await listRazorpayCapturedPayments(limit)
      const sb2 = isSupabaseConfigured() ? getSupabaseAdmin() : null

      for (const p of live) {
        if (seenIds.has(p.id)) continue
        let email = p.email
        if (!email && p.userId && sb2) {
          const { data } = await sb2.auth.admin.getUserById(p.userId)
          email = data?.user?.email ?? null
        }
        dbRows.push({
          id: p.id,
          userId: p.userId ?? '—',
          email,
          razorpayPaymentId: p.id,
          amountInr: p.amountInr,
          plan: 'pro',
          status: p.status,
          createdAt: p.createdAt,
          source: 'razorpay',
        })
      }
    }

    dbRows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return dbRows.slice(0, limit)
  } catch (err) {
    console.error('[admin/users] payments', err)
    return []
  }
}

export async function findAuthUserByEmail(email: string) {
  if (!isSupabaseConfigured()) return null
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  try {
    const sb = getSupabaseAdmin()
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = (data?.users ?? []).find((u) => u.email?.toLowerCase() === normalized)
    return user ?? null
  } catch (err) {
    console.error('[admin/users] findByEmail', err)
    return null
  }
}

export async function adminSetUserPlan(
  userId: string,
  plan: UserPlan,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' }
  }

  let success = await setUserPlan(userId, plan)
  if (!success) {
    await ensureDashboardTables()
    success = await setUserPlan(userId, plan)
  }

  if (!success) {
    return { ok: false, error: 'Could not update plan — check user_usage table exists' }
  }

  return { ok: true }
}

export async function adminGrantProByEmail(
  email: string,
): Promise<{ ok: true; userId: string; email: string } | { ok: false; error: string }> {
  const user = await findAuthUserByEmail(email)
  if (!user) {
    return { ok: false, error: `No account found for ${email}` }
  }

  const result = await adminSetUserPlan(user.id, 'pro')
  if (result.ok === false) return result

  await recordUserPayment({
    userId: user.id,
    razorpayOrderId: 'admin_manual',
    razorpayPaymentId: `admin_manual_${user.id}`,
    amountInr: PRO_PRICE_INR,
    plan: 'pro',
  })

  return { ok: true, userId: user.id, email: user.email ?? email }
}
