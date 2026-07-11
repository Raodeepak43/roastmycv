import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

import { USER_FREE_ROASTS, USER_FREE_RESUME_AI, USER_FREE_RESUME_PDF, type UserPlan } from '@/lib/dashboard/constants'

export { USER_FREE_ROASTS, USER_FREE_RESUME_AI, USER_FREE_RESUME_PDF, type UserPlan }

export interface UserUsageRow {
  user_id: string
  roasts_used: number
  resume_ai_used: number
  resume_pdf_used: number
  plan: UserPlan
  updated_at: string
}

export interface UserRoastRow {
  id: string
  user_id: string
  score: number
  title: string | null
  verdict: string | null
  intensity: string
  language: string
  file_name: string | null
  roast_data: {
    lines: string[]
    fixes?: string[]
  }
  created_at: string
}

export async function getAuthedUserId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}

async function admin() {
  if (!isSupabaseConfigured()) return null
  return getSupabaseAdmin()
}

export async function ensureUserUsage(userId: string): Promise<UserUsageRow | null> {
  const sb = await admin()
  if (!sb) return null

  const { data: existing } = await sb.from('user_usage').select('*').eq('user_id', userId).maybeSingle()
  if (existing) return existing as UserUsageRow

  const { data, error } = await sb
    .from('user_usage')
    .insert({ user_id: userId })
    .select('*')
    .single()

  if (error) {
    const { data: retry } = await sb.from('user_usage').select('*').eq('user_id', userId).maybeSingle()
    return (retry as UserUsageRow) ?? null
  }
  return data as UserUsageRow
}

async function getAuthPlan(userId: string): Promise<UserPlan | null> {
  const sb = await admin()
  if (!sb) return null
  try {
    const { data } = await sb.auth.admin.getUserById(userId)
    const plan = data?.user?.app_metadata?.plan
    return plan === 'pro' || plan === 'free' ? plan : null
  } catch {
    return null
  }
}

async function syncAuthPlan(userId: string, plan: UserPlan): Promise<boolean> {
  const sb = await admin()
  if (!sb) return false
  try {
    const { data: existingUser } = await sb.auth.admin.getUserById(userId)
    const existingMeta = (existingUser?.user?.app_metadata ?? {}) as Record<string, unknown>
    const { error } = await sb.auth.admin.updateUserById(userId, {
      app_metadata: { ...existingMeta, plan },
    })
    return !error
  } catch (err) {
    console.error('[syncAuthPlan]', err)
    return false
  }
}

export async function getUserUsage(userId: string) {
  const row = await ensureUserUsage(userId)
  let plan: UserPlan = (row?.plan as UserPlan) ?? 'free'
  if (plan !== 'pro') {
    const authPlan = await getAuthPlan(userId)
    if (authPlan === 'pro') plan = 'pro'
  }

  const usageRow = row ?? {
    roasts_used: 0,
    resume_ai_used: 0,
    resume_pdf_used: 0,
    plan,
  }

  const isPro = plan === 'pro'
  return {
    plan,
    roastsUsed: usageRow.roasts_used ?? 0,
    roastsLeft: isPro ? 999 : Math.max(0, USER_FREE_ROASTS - (usageRow.roasts_used ?? 0)),
    roastsLimit: isPro ? 999 : USER_FREE_ROASTS,
    resumeAiUsed: usageRow.resume_ai_used ?? 0,
    resumeAiLeft: isPro ? 999 : Math.max(0, USER_FREE_RESUME_AI - (usageRow.resume_ai_used ?? 0)),
    resumePdfUsed: usageRow.resume_pdf_used ?? 0,
    resumePdfLeft: isPro ? 999 : Math.max(0, USER_FREE_RESUME_PDF - (usageRow.resume_pdf_used ?? 0)),
  }
}

export async function incrementUserRoasts(userId: string) {
  const sb = await admin()
  if (!sb) return null
  await ensureUserUsage(userId)
  const usage = await getUserUsage(userId)
  if (usage.plan !== 'pro' && usage.roastsLeft <= 0) return null

  const { data } = await sb
    .from('user_usage')
    .update({
      roasts_used: usage.roastsUsed + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single()

  return data as UserUsageRow
}

export async function saveUserRoast(
  userId: string,
  id: string,
  payload: {
    score: number
    title: string
    verdict: string
    intensity: string
    language: string
    fileName?: string
    lines: string[]
    fixes?: string[]
    resumeText?: string
  },
) {
  const sb = await admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('user_roasts')
    .insert({
      id,
      user_id: userId,
      score: payload.score,
      title: payload.title,
      verdict: payload.verdict,
      intensity: payload.intensity,
      language: payload.language,
      file_name: payload.fileName ?? null,
      roast_data: {
        lines: payload.lines,
        fixes: payload.fixes,
        resumeText: payload.resumeText?.slice(0, 12000),
      },
    })
    .select('*')
    .single()

  if (error) {
    console.error('[saveUserRoast]', error.message)
    return null
  }
  return data as UserRoastRow
}

export async function listUserRoasts(userId: string, limit = 20) {
  const sb = await admin()
  if (!sb) return []

  const { data, error } = await sb
    .from('user_roasts')
    .select('id, score, title, verdict, intensity, language, file_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function getUserRoast(userId: string, id: string) {
  const sb = await admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('user_roasts')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return data as UserRoastRow
}

export async function setUserPlan(userId: string, plan: UserPlan): Promise<boolean> {
  const sb = await admin()
  if (!sb) {
    console.error('[setUserPlan] Supabase admin unavailable')
    return false
  }

  const authOk = await syncAuthPlan(userId, plan)

  const now = new Date().toISOString()
  const { data, error } = await sb
    .from('user_usage')
    .upsert({ user_id: userId, plan, updated_at: now }, { onConflict: 'user_id' })
    .select('plan')
    .single()

  if (error) {
    console.error('[setUserPlan]', error.code, error.message)
    return authOk
  }

  return authOk || data?.plan === plan
}

/** Permanently delete dashboard data and Supabase Auth user (service role). */
export async function deleteUserAccount(userId: string, email?: string | null): Promise<boolean> {
  const sb = await admin()
  if (!sb) return false

  const { error: roastsError } = await sb.from('user_roasts').delete().eq('user_id', userId)
  if (roastsError) {
    console.error('[deleteUserAccount] user_roasts', roastsError.message)
    return false
  }

  const { error: paymentsError } = await sb.from('user_payments').delete().eq('user_id', userId)
  if (paymentsError) {
    console.error('[deleteUserAccount] user_payments', paymentsError.message)
  }

  const { error: usageError } = await sb.from('user_usage').delete().eq('user_id', userId)
  if (usageError) {
    console.error('[deleteUserAccount] user_usage', usageError.message)
    return false
  }

  if (email) {
    const { error: emailError } = await sb.from('email_signups').delete().eq('email', email.toLowerCase())
    if (emailError) {
      console.error('[deleteUserAccount] email_signups', emailError.message)
    }
  }

  const { error: authError } = await sb.auth.admin.deleteUser(userId)
  if (authError) {
    console.error('[deleteUserAccount] auth', authError.message)
    return false
  }

  return true
}

export function createRoastId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}
