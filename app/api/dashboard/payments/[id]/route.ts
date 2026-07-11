import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getUserPayment } from '@/lib/dashboard/payments'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payment = await getUserPayment(user.id, params.id)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amountInr: payment.amount_inr,
        currency: payment.currency,
        plan: payment.plan,
        status: payment.status,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        createdAt: payment.created_at,
      },
      user: {
        email: user.email ?? '',
        name:
          (user.user_metadata?.full_name as string | undefined)?.trim() ||
          user.email?.split('@')[0] ||
          'User',
      },
    })
  } catch (err) {
    console.error('[dashboard/payments/id]', err)
    return NextResponse.json({ error: 'Failed to load payment' }, { status: 500 })
  }
}
