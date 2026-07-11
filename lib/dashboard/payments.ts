import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { PRO_PRICE_INR } from '@/lib/plans'

export interface UserPaymentRow {
  id: string
  user_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  amount_inr: number
  currency: string
  plan: string
  status: 'paid' | 'pending' | 'failed'
  created_at: string
}

export const PRO_PLAN_LABEL = 'Pro Plan — Lifetime (One-time)'

async function admin() {
  if (!isSupabaseConfigured()) return null
  return getSupabaseAdmin()
}

export async function getPaymentByRazorpayId(paymentId: string): Promise<UserPaymentRow | null> {
  const sb = await admin()
  if (sb) {
    const { data, error } = await sb
      .from('user_payments')
      .select('*')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle()

    if (!error && data) return data as UserPaymentRow
  }

  if (typeof window === 'undefined') {
    const { getPaymentByRazorpayIdPg } = await import('@/lib/dashboard/payments-pg')
    return getPaymentByRazorpayIdPg(paymentId)
  }
  return null
}

export async function recordUserPayment(input: {
  userId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  amountInr?: number
  plan?: string
}): Promise<UserPaymentRow | null> {
  const existing = await getPaymentByRazorpayId(input.razorpayPaymentId)
  if (existing) return existing

  const sb = await admin()
  if (sb) {
    const { data, error } = await sb
      .from('user_payments')
      .insert({
        user_id: input.userId,
        razorpay_order_id: input.razorpayOrderId,
        razorpay_payment_id: input.razorpayPaymentId,
        amount_inr: input.amountInr ?? PRO_PRICE_INR,
        currency: 'INR',
        plan: input.plan ?? 'pro',
        status: 'paid',
      })
      .select('*')
      .single()

    if (!error && data) return data as UserPaymentRow
    if (error) console.error('[recordUserPayment] REST', error.message)
  }

  if (typeof window === 'undefined') {
    const { insertPaymentPg } = await import('@/lib/dashboard/payments-pg')
    return insertPaymentPg({
      userId: input.userId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amountInr: input.amountInr ?? PRO_PRICE_INR,
      plan: input.plan ?? 'pro',
    })
  }
  return null
}

export async function listUserPayments(userId: string, limit = 20): Promise<UserPaymentRow[]> {
  const sb = await admin()
  if (!sb) return []

  const { data, error } = await sb
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as UserPaymentRow[]
}

export async function getUserPayment(userId: string, paymentId: string): Promise<UserPaymentRow | null> {
  const sb = await admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('id', paymentId)
    .maybeSingle()

  if (error || !data) return null
  return data as UserPaymentRow
}
