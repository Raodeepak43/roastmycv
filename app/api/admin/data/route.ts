import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, ADMIN_COOKIE } from '@/lib/admin/auth'
import {
  getAdminOverview,
  getAllEmails,
  getAllTickerSignups,
  getAllUsage,
} from '@/lib/admin/data'
import { getAdminUsers, getAdminPayments } from '@/lib/admin/users'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifyAdminSession(token)
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const view = req.nextUrl.searchParams.get('view') ?? 'overview'

  if (view === 'emails') {
    return NextResponse.json({ rows: await getAllEmails() })
  }
  if (view === 'signups') {
    return NextResponse.json({ rows: await getAllTickerSignups() })
  }
  if (view === 'usage') {
    return NextResponse.json({ rows: await getAllUsage() })
  }
  if (view === 'users') {
    return NextResponse.json({ rows: await getAdminUsers() })
  }
  if (view === 'payments') {
    return NextResponse.json({ rows: await getAdminPayments() })
  }

  return NextResponse.json(await getAdminOverview())
}
