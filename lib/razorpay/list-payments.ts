import { getRazorpayKeyId, getRazorpayKeySecret, isRazorpayConfigured } from '@/lib/razorpay/config'

export interface RazorpayPaymentItem {
  id: string
  orderId: string
  amountInr: number
  status: string
  email: string | null
  userId: string | null
  createdAt: string
}

type RazorpayPaymentRaw = {
  id: string
  order_id: string
  amount: number
  status: string
  email?: string
  created_at: number
}

type RazorpayOrderRaw = {
  id: string
  notes?: Record<string, string>
}

function authHeader() {
  const keyId = getRazorpayKeyId()!
  const keySecret = getRazorpayKeySecret()!
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
}

async function fetchOrder(orderId: string): Promise<RazorpayOrderRaw | null> {
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: authHeader() },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    return (await res.json()) as RazorpayOrderRaw
  } catch {
    return null
  }
}

/** List captured Razorpay payments (live from Razorpay API). */
export async function listRazorpayCapturedPayments(limit = 100): Promise<RazorpayPaymentItem[]> {
  if (!isRazorpayConfigured()) return []

  try {
    const res = await fetch(`https://api.razorpay.com/v1/payments?count=${Math.min(limit, 100)}`, {
      headers: { Authorization: authHeader() },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      console.error('[razorpay/list]', res.status, await res.text().catch(() => ''))
      return []
    }

    const json = (await res.json()) as { items?: RazorpayPaymentRaw[] }
    const captured = (json.items ?? []).filter((p) => p.status === 'captured')

    const orderCache = new Map<string, RazorpayOrderRaw | null>()
    const results: RazorpayPaymentItem[] = []

    for (const p of captured) {
      let order = orderCache.get(p.order_id)
      if (order === undefined) {
        order = await fetchOrder(p.order_id)
        orderCache.set(p.order_id, order)
      }
      const userId = order?.notes?.userId?.trim() || null

      results.push({
        id: p.id,
        orderId: p.order_id,
        amountInr: Math.round(p.amount / 100),
        status: 'paid',
        email: p.email?.trim() || null,
        userId,
        createdAt: new Date(p.created_at * 1000).toISOString(),
      })
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return results
  } catch (err) {
    console.error('[razorpay/list]', err)
    return []
  }
}
