import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { PRO_PRICE_INR } from '@/lib/plans'
import { ensureDashboardTables } from '@/lib/dashboard/ensure-tables'
import { recordUserPayment } from '@/lib/dashboard/payments'
import { listRazorpayCapturedPayments } from '@/lib/razorpay/list-payments'
import { isRazorpayConfigured } from '@/lib/razorpay/config'

export interface SyncPaymentsResult {
  synced: number
  skipped: number
  razorpayTotal: number
  errors: string[]
}

/** Pull captured Razorpay payments into user_payments (links via order notes.userId). */
export async function syncRazorpayPaymentsToDb(): Promise<SyncPaymentsResult> {
  const result: SyncPaymentsResult = { synced: 0, skipped: 0, razorpayTotal: 0, errors: [] }

  if (!isRazorpayConfigured()) {
    result.errors.push('Razorpay not configured')
    return result
  }

  await ensureDashboardTables()

  const payments = await listRazorpayCapturedPayments(100)
  result.razorpayTotal = payments.length

  for (const p of payments) {
    if (!p.userId) {
      result.skipped += 1
      continue
    }

    const row = await recordUserPayment({
      userId: p.userId,
      razorpayOrderId: p.orderId,
      razorpayPaymentId: p.id,
      amountInr: p.amountInr || PRO_PRICE_INR,
      plan: 'pro',
    })

    if (row) {
      result.synced += 1
    } else {
      result.errors.push(`Could not save ${p.id}`)
    }
  }

  return result
}

export async function enrichPaymentEmails(
  rows: { userId: string; email: string | null }[],
): Promise<Map<string, string>> {
  const emailMap = new Map<string, string>()
  if (!isSupabaseConfigured()) return emailMap

  const sb = getSupabaseAdmin()
  await Promise.all(
    rows.map(async ({ userId, email }) => {
      if (email) {
        emailMap.set(userId, email)
        return
      }
      try {
        const { data } = await sb.auth.admin.getUserById(userId)
        if (data?.user?.email) emailMap.set(userId, data.user.email)
      } catch {
        /* ignore */
      }
    }),
  )
  return emailMap
}
