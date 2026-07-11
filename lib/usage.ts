import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

declare global {
  // eslint-disable-next-line no-var
  var roastUsage: Record<string, number> | undefined
}

export const FREE_LIMIT = 2

/** Lifetime cap per browser fingerprint — no monthly reset. Pro unlocks unlimited. */

if (!global.roastUsage) {
  global.roastUsage = {}
}

function memoryUsed(fp: string): number {
  return global.roastUsage![fp] || 0
}

async function supabaseIsPaid(fp: string): Promise<boolean | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('usage_limits')
      .select('paid')
      .eq('fingerprint', fp)
      .maybeSingle()
    if (error) return null
    return Boolean(data?.paid)
  } catch {
    return null
  }
}

async function supabaseUsed(fp: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('usage_limits')
      .select('used_count')
      .eq('fingerprint', fp)
      .maybeSingle()
    if (error) return null
    return typeof data?.used_count === 'number' ? data.used_count : 0
  } catch {
    return null
  }
}

async function supabaseIncrement(fp: string): Promise<{ used: number; usesLeft: number } | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const current = (await supabaseUsed(fp)) ?? 0
    const used = current + 1
    const paid = (await supabaseIsPaid(fp)) ?? false
    const { error } = await supabase.from('usage_limits').upsert(
      { fingerprint: fp, used_count: used, updated_at: new Date().toISOString() },
      { onConflict: 'fingerprint' }
    )
    if (error) return null
    global.roastUsage![fp] = used
    return { used, usesLeft: paid ? 999 : Math.max(0, FREE_LIMIT - used) }
  } catch {
    return null
  }
}

export async function getUsedCount(fp: string): Promise<number> {
  const fromDb = await supabaseUsed(fp)
  if (fromDb !== null) {
    global.roastUsage![fp] = fromDb
    return fromDb
  }
  return memoryUsed(fp)
}

export async function isFingerprintPaid(fp: string): Promise<boolean> {
  const fromDb = await supabaseIsPaid(fp)
  return fromDb === true
}

export async function markFingerprintPaid(fp: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  try {
    const supabase = getSupabaseAdmin()
    const used = (await supabaseUsed(fp)) ?? memoryUsed(fp)
    const { error } = await supabase.from('usage_limits').upsert(
      {
        fingerprint: fp,
        used_count: used,
        paid: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'fingerprint' }
    )
    return !error
  } catch {
    return false
  }
}

export async function getUsesLeft(fp: string): Promise<number> {
  if (await isFingerprintPaid(fp)) return 999
  const used = await getUsedCount(fp)
  return Math.max(0, FREE_LIMIT - used)
}

export async function incrementUsage(fp: string): Promise<{ usesLeft: number; used: number }> {
  const fromDb = await supabaseIncrement(fp)
  if (fromDb) return fromDb

  global.roastUsage![fp] = memoryUsed(fp) + 1
  const used = global.roastUsage![fp]
  return { usesLeft: Math.max(0, FREE_LIMIT - used), used }
}

export async function isLimitReached(fp: string, paid = false): Promise<boolean> {
  if (paid || (await isFingerprintPaid(fp))) return false
  const used = await getUsedCount(fp)
  return used >= FREE_LIMIT
}
