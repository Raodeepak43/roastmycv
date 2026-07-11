import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

declare global {
  // eslint-disable-next-line no-var
  var linkedinUsage: Record<string, number> | undefined
}

export const LINKEDIN_FREE_LIMIT = 2

if (!global.linkedinUsage) {
  global.linkedinUsage = {}
}

function memoryUsed(fp: string): number {
  return global.linkedinUsage![fp] || 0
}

async function supabaseLinkedInUsed(fp: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('usage_limits')
      .select('linkedin_used_count, paid')
      .eq('fingerprint', fp)
      .maybeSingle()
    if (error) return null
    return typeof data?.linkedin_used_count === 'number' ? data.linkedin_used_count : 0
  } catch {
    return null
  }
}

async function isPaid(fp: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('usage_limits').select('paid').eq('fingerprint', fp).maybeSingle()
    return Boolean(data?.paid)
  } catch {
    return false
  }
}

export async function getLinkedInUsedCount(fp: string): Promise<number> {
  const fromDb = await supabaseLinkedInUsed(fp)
  if (fromDb !== null) {
    global.linkedinUsage![fp] = fromDb
    return fromDb
  }
  return memoryUsed(fp)
}

export async function getLinkedInUsesLeft(fp: string): Promise<number> {
  if (await isPaid(fp)) return 999
  const used = await getLinkedInUsedCount(fp)
  return Math.max(0, LINKEDIN_FREE_LIMIT - used)
}

export async function isLinkedInLimitReached(fp: string): Promise<boolean> {
  if (await isPaid(fp)) return false
  return (await getLinkedInUsedCount(fp)) >= LINKEDIN_FREE_LIMIT
}

export async function incrementLinkedInUsage(fp: string): Promise<{ usesLeft: number; used: number }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()
      const current = (await supabaseLinkedInUsed(fp)) ?? memoryUsed(fp)
      const used = current + 1
      const paid = await isPaid(fp)
      const { error } = await supabase.from('usage_limits').upsert(
        {
          fingerprint: fp,
          linkedin_used_count: used,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'fingerprint' },
      )
      if (!error) {
        global.linkedinUsage![fp] = used
        return { used, usesLeft: paid ? 999 : Math.max(0, LINKEDIN_FREE_LIMIT - used) }
      }
    } catch {
      /* fall through */
    }
  }

  global.linkedinUsage![fp] = memoryUsed(fp) + 1
  const used = global.linkedinUsage![fp]
  return { usesLeft: Math.max(0, LINKEDIN_FREE_LIMIT - used), used }
}
