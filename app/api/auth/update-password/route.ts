import { NextResponse } from 'next/server'
import {
  AUTH_BODY_INVALID,
  AUTH_PASSWORD_UPDATED,
  AUTH_PASSWORD_UPDATE_INVALID,
  AUTH_SERVER_ERROR,
} from '@/lib/auth/messages'
import { sanitizePasswordInput } from '@/lib/auth/validation'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const passwordSchema = z.string().min(6).max(128)

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: AUTH_PASSWORD_UPDATE_INVALID }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: AUTH_BODY_INVALID }, { status: 400 })
  }

  const password = sanitizePasswordInput((body as Record<string, unknown>)?.password)
  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) {
    return NextResponse.json({ error: AUTH_PASSWORD_UPDATE_INVALID }, { status: 400 })
  }

  try {
    const response = NextResponse.json({ message: AUTH_PASSWORD_UPDATED })
    const supabase = createRouteHandlerClient(response)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: AUTH_PASSWORD_UPDATE_INVALID }, { status: 401 })
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data })
    if (error) {
      console.warn('[auth/update-password] failed', { code: error.code ?? 'unknown' })
      return NextResponse.json({ error: AUTH_PASSWORD_UPDATE_INVALID }, { status: 400 })
    }

    return response
  } catch (err) {
    console.error('[auth/update-password]', err)
    return NextResponse.json({ error: AUTH_SERVER_ERROR }, { status: 500 })
  }
}
