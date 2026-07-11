import { ensureDashboardTables } from '@/lib/dashboard/ensure-tables'
import { getPaymentByRazorpayId, recordUserPayment } from '@/lib/dashboard/payments'
import { setUserPlan } from '@/lib/dashboard/user-data'
import { PRO_PRICE_INR } from '@/lib/plans'

export async function upgradeUserAfterPayment(input: {
  userId: string
  orderId: string
  paymentId: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const existing = await getPaymentByRazorpayId(input.paymentId)
  if (existing && existing.user_id !== input.userId) {
    return { ok: false, reason: 'Payment is linked to a different account' }
  }

  if (!existing) {
    await recordUserPayment({
      userId: input.userId,
      razorpayOrderId: input.orderId,
      razorpayPaymentId: input.paymentId,
      amountInr: PRO_PRICE_INR,
      plan: 'pro',
    })
  }

  let upgraded = await setUserPlan(input.userId, 'pro')
  if (!upgraded) {
    await ensureDashboardTables()
    upgraded = await setUserPlan(input.userId, 'pro')
  }

  if (!upgraded) {
    return { ok: false, reason: 'Account upgrade failed after payment' }
  }

  return { ok: true }
}
