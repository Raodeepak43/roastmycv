import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { listUserPayments } from '@/lib/dashboard/payments'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await listUserPayments(user.id)
    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amountInr: p.amount_inr,
        currency: p.currency,
        plan: p.plan,
        status: p.status,
        razorpayPaymentId: p.razorpay_payment_id,
        createdAt: p.created_at,
      })),
    })
  } catch (err) {
    console.error('[dashboard/payments]', err)
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 })
  }
}
