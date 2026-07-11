import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin/auth'
import { getDashboardDbStatus } from '@/lib/dashboard/db-health'
import { runDashboardMigrations, syncPostgrestSchemaOnly } from '@/lib/db/run-migrations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  action: z.enum(['migrate', 'sync_api']).optional(),
})

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) {
    return NextResponse.json(
      { error: 'POSTGRES_URL not configured on this environment' },
      { status: 503 },
    )
  }

  let action: 'migrate' | 'sync_api' = 'migrate'
  try {
    const raw = await req.json()
    const parsed = bodySchema.safeParse(raw)
    if (parsed.success && parsed.data.action) action = parsed.data.action
  } catch {
    // empty body = full migrate
  }

  try {
    const result =
      action === 'sync_api' ? await syncPostgrestSchemaOnly() : await runDashboardMigrations()

    const status = await getDashboardDbStatus()

    let message: string
    if (status.ready) {
      message = 'Database ready — Pro upgrades, payments, and roast history will work now.'
    } else if (status.pgReady && !status.apiReady) {
      message =
        'Tables exist in Postgres but Supabase API is still syncing. Click "Sync API schema" or wait 1 minute and refresh.'
    } else if (result.pgReady) {
      message = 'Tables created. Syncing API — try "Sync API schema" if Pro grant still fails.'
    } else {
      message = 'Migration finished with warnings — check Supabase SQL Editor if issues persist.'
    }

    return NextResponse.json({
      ok: true,
      ...status,
      userUsageReady: status.ready,
      message,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Migration failed'
    console.error('[admin/migrate-db]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  const status = await getDashboardDbStatus()
  return NextResponse.json({
    postgresConfigured: Boolean(url),
    ...status,
    userUsageReady: status.ready,
  })
}
