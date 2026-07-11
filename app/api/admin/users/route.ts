import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminSession, ADMIN_COOKIE } from '@/lib/admin/auth'
import { adminGrantProByEmail, adminSetUserPlan } from '@/lib/admin/users'
import { ensureDashboardTables } from '@/lib/dashboard/ensure-tables'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifyAdminSession(token)
}

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('grant_pro'),
    email: z.string().email(),
  }),
  z.object({
    action: z.literal('set_plan'),
    userId: z.string().uuid(),
    plan: z.enum(['free', 'pro']),
  }),
  z.object({
    action: z.literal('set_plan_by_email'),
    email: z.string().email(),
    plan: z.enum(['free', 'pro']),
  }),
])

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }

  const body = parsed.data

  await ensureDashboardTables()

  if (body.action === 'grant_pro') {
    const result = await adminGrantProByEmail(body.email)
    if (result.ok === false) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({
      ok: true,
      message: `Pro granted to ${result.email}`,
      userId: result.userId,
      plan: 'pro',
    })
  }

  if (body.action === 'set_plan_by_email') {
    const grant = body.plan === 'pro'
      ? await adminGrantProByEmail(body.email)
      : await (async () => {
          const { findAuthUserByEmail } = await import('@/lib/admin/users')
          const user = await findAuthUserByEmail(body.email)
          if (!user) return { ok: false as const, error: `No account found for ${body.email}` }
          const r = await adminSetUserPlan(user.id, body.plan)
          if (r.ok === false) return r
          return { ok: true as const, userId: user.id, email: user.email ?? body.email }
        })()

    if (grant.ok === false) {
      return NextResponse.json({ error: grant.error }, { status: 400 })
    }
    return NextResponse.json({
      ok: true,
      message: `Plan set to ${body.plan} for ${grant.email}`,
      userId: grant.userId,
      plan: body.plan,
    })
  }

  const result = await adminSetUserPlan(body.userId, body.plan)
  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: `Plan updated to ${body.plan}`,
    userId: body.userId,
    plan: body.plan,
  })
}
