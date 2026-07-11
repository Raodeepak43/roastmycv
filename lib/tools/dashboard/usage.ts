import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { getUserUsage } from '@/lib/dashboard/user-data'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { TOOL_ACCESS } from '@/lib/tools/dashboard/config'

function periodKey(daily: boolean): string {
  if (!daily) return 'lifetime'
  return new Date().toISOString().slice(0, 10)
}

export async function getToolUsageCount(userId: string, toolSlug: ToolSlug): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const access = TOOL_ACCESS[toolSlug]
  const sb = getSupabaseAdmin()
  const key = periodKey(access.daily)

  const { data } = await sb
    .from('user_tool_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('tool_slug', toolSlug)
    .eq('period_key', key)
    .maybeSingle()

  return data?.count ?? 0
}

export async function incrementToolUsage(userId: string, toolSlug: ToolSlug): Promise<void> {
  if (!isSupabaseConfigured()) return
  const access = TOOL_ACCESS[toolSlug]
  const sb = getSupabaseAdmin()
  const key = periodKey(access.daily)
  const current = await getToolUsageCount(userId, toolSlug)

  await sb.from('user_tool_usage').upsert(
    {
      user_id: userId,
      tool_slug: toolSlug,
      period_key: key,
      count: current + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tool_slug,period_key' },
  )
}

export type ToolGateResult =
  | { allowed: true; isPro: boolean; used: number; limit: number }
  | { allowed: false; status: 403 | 429; error: string; isPro: boolean; used: number; limit: number }

export async function enforceToolAccess(userId: string, toolSlug: ToolSlug): Promise<ToolGateResult> {
  const usage = await getUserUsage(userId)
  const access = TOOL_ACCESS[toolSlug]
  const isPro = usage.plan === 'pro'
  const used = await getToolUsageCount(userId, toolSlug)
  const limit = isPro ? 999 : access.freeLimit

  if (access.unlimited && !access.proOnly) {
    return { allowed: true, isPro, used, limit: 999 }
  }

  if (access.proOnly && !isPro) {
    return {
      allowed: false,
      status: 403,
      error: 'This tool is available on Pro. Upgrade to unlock.',
      isPro,
      used,
      limit: 0,
    }
  }

  if (!isPro && used >= access.freeLimit) {
    return {
      allowed: false,
      status: 429,
      error: access.daily
        ? `Daily limit reached (${access.freeLimit}/day). Upgrade to Pro for unlimited access.`
        : `Free limit reached (${access.freeLimit} uses). Upgrade to Pro for unlimited access.`,
      isPro,
      used,
      limit: access.freeLimit,
    }
  }

  return { allowed: true, isPro, used, limit }
}

export async function recordToolUse(userId: string, toolSlug: ToolSlug, isPro: boolean): Promise<void> {
  if (isPro || TOOL_ACCESS[toolSlug].unlimited) return
  await incrementToolUsage(userId, toolSlug)
}
