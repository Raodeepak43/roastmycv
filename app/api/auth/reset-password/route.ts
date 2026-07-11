import { NextResponse } from 'next/server'
import { sendLockoutResetEmail } from '@/lib/auth/lockout-email'
import {
  AUTH_BODY_INVALID,
  AUTH_RESET_SUCCESS,
} from '@/lib/auth/messages'
import { sanitizeTextInput } from '@/lib/auth/validation'
import { isSupabaseAuthConfigured } from '@/lib/supabase/env'
import { z } from 'zod'

const resetEmailSchema = z.string().min(3).max(254).email()

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ message: AUTH_RESET_SUCCESS })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: AUTH_BODY_INVALID }, { status: 400 })
  }

  const email = sanitizeTextInput((body as Record<string, unknown>)?.email).toLowerCase()
  const parsed = resetEmailSchema.safeParse(email)
  if (!parsed.success) {
    return NextResponse.json({ message: AUTH_RESET_SUCCESS })
  }

  try {
    await sendLockoutResetEmail(parsed.data, request)
    return NextResponse.json({ message: AUTH_RESET_SUCCESS })
  } catch (err) {
    console.error('[auth/reset-password]', err)
    return NextResponse.json({ message: AUTH_RESET_SUCCESS })
  }
}
