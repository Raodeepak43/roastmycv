import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { buildTickerMessage } from '@/lib/ticker'

export type TickerEntry = {
  name: string
  score?: number
  language?: string
  at: string
}

declare global {
  // eslint-disable-next-line no-var
  var roastTickerMem: TickerEntry[] | undefined
  // eslint-disable-next-line no-var
  var statsBucketReady: boolean | undefined
}

const STORAGE_BUCKET = 'mycvroast-data'
const STORAGE_FILE = 'ticker_recent.json'
const MAX_STORED = 50
export const TICKER_DISPLAY_COUNT = 4

function memoryEntries(): TickerEntry[] {
  return global.roastTickerMem ?? []
}

/** Keep only the latest entry per name (fixes duplicate lala/ravi rows). */
export function dedupeTickerEntries(entries: TickerEntry[]): TickerEntry[] {
  const latestByName = new Map<string, TickerEntry>()
  for (const entry of entries) {
    const key = entry.name.trim().toLowerCase()
    const existing = latestByName.get(key)
    if (!existing || new Date(entry.at).getTime() > new Date(existing.at).getTime()) {
      latestByName.set(key, entry)
    }
  }
  return Array.from(latestByName.values()).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

async function ensureStorageBucket(): Promise<boolean> {
  if (global.statsBucketReady) return true
  if (!isSupabaseConfigured()) return false
  try {
    const supabase = getSupabaseAdmin()
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.some((b) => b.name === STORAGE_BUCKET)) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: false })
      if (error && !error.message.includes('already exists')) {
        console.error('ticker bucket create:', error.message)
        return false
      }
    }
    global.statsBucketReady = true
    return true
  } catch (e) {
    console.error('ticker bucket ensure exception:', e)
    return false
  }
}

async function storageRead(): Promise<TickerEntry[] | null> {
  if (!isSupabaseConfigured()) return null
  if (!(await ensureStorageBucket())) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_FILE)
    if (error) {
      if (error.message.includes('not found') || error.message.includes('Object not found')) {
        return null
      }
      console.error('ticker storage read:', error.message)
      return null
    }
    const parsed = JSON.parse(await data.text())
    if (!Array.isArray(parsed?.entries)) return null
    return dedupeTickerEntries(parsed.entries as TickerEntry[])
  } catch (e) {
    console.error('ticker storage read exception:', e)
    return null
  }
}

async function storageWrite(entries: TickerEntry[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  if (!(await ensureStorageBucket())) return false
  try {
    const supabase = getSupabaseAdmin()
    const deduped = dedupeTickerEntries(entries).slice(0, MAX_STORED)
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE, JSON.stringify({ entries: deduped }), {
        upsert: true,
        contentType: 'application/json',
      })
    if (error) {
      console.error('ticker storage write:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.error('ticker storage write exception:', e)
    return false
  }
}

async function tableRead(): Promise<TickerEntry[] | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('roast_signups')
      .select('name, score, language, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_STORED)
    if (error) {
      if (error.message.includes('Could not find the table') || error.message.includes('PGRST205')) {
        return null
      }
      console.error('ticker table read:', error.message)
      return null
    }
    if (!data?.length) return []
    return dedupeTickerEntries(
      data.map((row) => ({
        name: row.name,
        score: row.score ?? undefined,
        language: row.language ?? undefined,
        at: row.created_at ?? new Date().toISOString(),
      })),
    )
  } catch {
    return null
  }
}

function mergeEntryLists(...lists: (TickerEntry[] | null | undefined)[]): TickerEntry[] {
  const combined: TickerEntry[] = []
  for (const list of lists) {
    if (list?.length) combined.push(...list)
  }
  return dedupeTickerEntries(combined).slice(0, MAX_STORED)
}

export async function getTickerEntries(): Promise<TickerEntry[]> {
  const fromStorage = await storageRead()
  const fromTable = await tableRead()
  const fromMemory = memoryEntries()

  const merged = mergeEntryLists(fromStorage, fromTable, fromMemory)
  global.roastTickerMem = merged
  return merged
}

export function entriesToMessages(entries: TickerEntry[], limit = TICKER_DISPLAY_COUNT): string[] {
  return dedupeTickerEntries(entries)
    .slice(0, limit)
    .map((e) => buildTickerMessage(e.name, e.score, e.language))
}

export async function appendTickerEntry(entry: Omit<TickerEntry, 'at'> & { at?: string }): Promise<TickerEntry[]> {
  const full: TickerEntry = {
    name: entry.name.trim(),
    score: entry.score,
    language: entry.language,
    at: entry.at ?? new Date().toISOString(),
  }

  const current = await getTickerEntries()
  const next = dedupeTickerEntries(mergeEntryLists([full], current))
  global.roastTickerMem = next
  await storageWrite(next)

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()
      const row = {
        name: full.name,
        score: full.score ?? null,
        language: full.language ?? null,
      }
      const { error } = await supabase.from('roast_signups').insert(row)
      if (error?.message.includes('language')) {
        await supabase.from('roast_signups').insert({
          name: full.name,
          score: full.score ?? null,
        })
      }
    } catch (e) {
      console.error('ticker table insert exception:', e)
    }
  }

  return next
}
