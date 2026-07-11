import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin/auth'
import { syncRazorpayPaymentsToDb } from '@/lib/admin/payments-sync'
import { getAdminPayments } from '@/lib/admin/users'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncRazorpayPaymentsToDb()
  const rows = await getAdminPayments()

  return NextResponse.json({
    ok: true,
    ...result,
    rows,
    message: `Synced ${result.synced} payment(s) from Razorpay. ${rows.length} total shown.`,
  })
}
