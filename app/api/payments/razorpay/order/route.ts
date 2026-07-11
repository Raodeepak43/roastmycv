import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUserId } from '@/lib/dashboard/user-data'
import { PRO_PRICE_INR } from '@/lib/plans'
import { getRazorpayKeyId, getRazorpayKeySecret, isRazorpayConfigured } from '@/lib/razorpay/config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  let body: { fp?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const userId = await getAuthedUserId()
  const fp = typeof body.fp === 'string' ? body.fp.trim() : undefined

  if (!userId && !fp) {
    return NextResponse.json({ error: 'Sign in or refresh the page and try again' }, { status: 400 })
  }

  const keyId = getRazorpayKeyId()!
  const keySecret = getRazorpayKeySecret()!
  const amount = PRO_PRICE_INR * 100
  const receipt = `pro_${Date.now().toString(36)}`

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        plan: 'pro',
        ...(userId ? { userId } : {}),
        ...(fp ? { fp: fp.slice(0, 64) } : {}),
      },
    }),
  })

  const data = (await res.json()) as { id?: string; error?: { description?: string } }
  if (!res.ok || !data.id) {
    console.error('[razorpay/order]', data)
    return NextResponse.json(
      { error: data.error?.description || 'Could not create payment order' },
      { status: 502 },
    )
  }

  return NextResponse.json({
    orderId: data.id,
    amount,
    currency: 'INR',
    keyId,
  })
}
