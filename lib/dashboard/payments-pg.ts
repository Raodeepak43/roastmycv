import { withPostgresClient } from '@/lib/db/postgres-client'
import type { UserPaymentRow } from '@/lib/dashboard/payments'

function pgUrl() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
}

export async function listPaymentsPg(limit = 100): Promise<UserPaymentRow[]> {
  const url = pgUrl()
  if (!url) return []

  try {
    return await withPostgresClient(url, async (client) => {
      const { rows } = await client.query<UserPaymentRow>(
        `SELECT id, user_id, razorpay_order_id, razorpay_payment_id, amount_inr, currency, plan, status, created_at
         FROM user_payments
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit],
      )
      return rows
    })
  } catch (err) {
    console.error('[payments-pg] list', err)
    return []
  }
}

export async function insertPaymentPg(input: {
  userId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  amountInr: number
  plan?: string
  status?: string
}): Promise<UserPaymentRow | null> {
  const url = pgUrl()
  if (!url) return null

  try {
    return await withPostgresClient(url, async (client) => {
      const { rows } = await client.query<UserPaymentRow>(
        `INSERT INTO user_payments (user_id, razorpay_order_id, razorpay_payment_id, amount_inr, currency, plan, status)
         VALUES ($1, $2, $3, $4, 'INR', $5, $6)
         ON CONFLICT (razorpay_payment_id) DO UPDATE SET status = EXCLUDED.status
         RETURNING id, user_id, razorpay_order_id, razorpay_payment_id, amount_inr, currency, plan, status, created_at`,
        [
          input.userId,
          input.razorpayOrderId,
          input.razorpayPaymentId,
          input.amountInr,
          input.plan ?? 'pro',
          input.status ?? 'paid',
        ],
      )
      return rows[0] ?? null
    })
  } catch (err) {
    console.error('[payments-pg] insert', err)
    return null
  }
}

export async function getPaymentByRazorpayIdPg(paymentId: string): Promise<UserPaymentRow | null> {
  const url = pgUrl()
  if (!url) return null

  try {
    return await withPostgresClient(url, async (client) => {
      const { rows } = await client.query<UserPaymentRow>(
        `SELECT id, user_id, razorpay_order_id, razorpay_payment_id, amount_inr, currency, plan, status, created_at
         FROM user_payments WHERE razorpay_payment_id = $1 LIMIT 1`,
        [paymentId],
      )
      return rows[0] ?? null
    })
  } catch {
    return null
  }
}
