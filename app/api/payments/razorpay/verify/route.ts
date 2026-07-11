import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUserId } from '@/lib/dashboard/user-data'
import { upgradeUserAfterPayment } from '@/lib/dashboard/upgrade-after-payment'
import { markFingerprintPaid } from '@/lib/usage'
import { getRazorpayKeySecret, isRazorpayConfigured } from '@/lib/razorpay/config'
import { verifyRazorpaySignature } from '@/lib/razorpay/verify'
import { SUPPORT_EMAIL } from '@/lib/support'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  let body: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    fp?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const orderId = body.razorpay_order_id?.trim()
  const paymentId = body.razorpay_payment_id?.trim()
  const signature = body.razorpay_signature?.trim()

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
  }

  const secret = getRazorpayKeySecret()!
  if (!verifyRazorpaySignature(orderId, paymentId, signature, secret)) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const userId = await getAuthedUserId()
  const fp = typeof body.fp === 'string' ? body.fp.trim() : undefined

  if (userId) {
    const result = await upgradeUserAfterPayment({ userId, orderId, paymentId })
    if (result.ok === false) {
      console.error('[razorpay/verify]', result.reason, { userId, orderId, paymentId })
      return NextResponse.json(
        {
          error:
            `Payment received but account upgrade failed — contact ${SUPPORT_EMAIL} with your payment ID`,
        },
        { status: 500 },
      )
    }
  } else if (fp) {
    const ok = await markFingerprintPaid(fp)
    if (!ok) {
      return NextResponse.json(
        { error: `Payment received but unlock failed — contact ${SUPPORT_EMAIL}` },
        { status: 500 },
      )
    }
  } else {
    return NextResponse.json({ error: 'Sign in or retry from the same device' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, plan: 'pro' })
}
