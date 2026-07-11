import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getUserUsage, listUserRoasts } from '@/lib/dashboard/user-data'
import { isDashboardDbReady } from '@/lib/dashboard/db-health'
import { sanitizeTextInput } from '@/lib/auth/validation'
import { resolveAvatarUrl } from '@/lib/auth/avatar'

export const dynamic = 'force-dynamic'

const displayNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .refine((value) => !/[<>{}[\]\\/`]/.test(value), 'Name contains invalid characters')

function resolveDisplayName(user: { user_metadata?: Record<string, unknown>; email?: string | null }) {
  return (
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'User'
  )
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUserUsage(user.id)
    const recentRoasts = await listUserRoasts(user.id, 5)
    const dbReady = await isDashboardDbReady()

    const name = resolveDisplayName(user)
    const avatarUrl = resolveAvatarUrl(user.user_metadata as Record<string, unknown> | undefined)

    return NextResponse.json({
      user: {
        id: user.id,
        name,
        email: user.email ?? '',
        avatarUrl,
        createdAt: user.created_at,
        hasDisplayName: Boolean((user.user_metadata?.full_name as string | undefined)?.trim()),
      },
      usage,
      recentRoasts,
      dbReady,
    })
  } catch (err) {
    console.error('[dashboard/me]', err)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const response = NextResponse.json({ ok: true })
    const supabase = createRouteHandlerClient(response)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rawName = sanitizeTextInput((body as Record<string, unknown>).name)
    const parsed = displayNameSchema.safeParse(rawName)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid name' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: parsed.data },
    })

    if (error) {
      console.error('[dashboard/me PATCH]', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
    }

    const name = data.user ? resolveDisplayName(data.user) : parsed.data
    const json = NextResponse.json({ name })
    response.cookies.getAll().forEach((cookie) => {
      json.cookies.set(cookie.name, cookie.value)
    })
    return json
  } catch (err) {
    console.error('[dashboard/me PATCH]', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
