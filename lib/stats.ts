import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

declare global {
  // eslint-disable-next-line no-var
  var roastCount: number | undefined
  // eslint-disable-next-line no-var
  var statsBucketReady: boolean | undefined
}

export const STATS_SEED = 1250

const STORAGE_BUCKET = 'mycvroast-data'
const STORAGE_FILE = 'roast_count.json'

function parseCount(val: unknown): number | null {
  if (val == null) return null
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isNaN(n) ? null : n
}

function isMissingTableError(message?: string): boolean {
  return Boolean(message?.includes('Could not find the table') || message?.includes('PGRST205'))
}

function memoryCount(): number {
  if (global.roastCount === undefined || global.roastCount < STATS_SEED) {
    global.roastCount = STATS_SEED
  }
  return global.roastCount
}

async function kvAvailable(): Promise<boolean> {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvGet(): Promise<number | null> {
  if (!(await kvAvailable())) return null
  try {
    const { kv } = await import('@vercel/kv')
    const val = await kv.get<number>('mycvroast:roast_count')
    return parseCount(val)
  } catch {
    return null
  }
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
        console.error('stats bucket create:', error.message)
        return false
      }
    }
    global.statsBucketReady = true
    return true
  } catch (e) {
    console.error('stats bucket ensure exception:', e)
    return false
  }
}

async function storageGet(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  if (!(await ensureStorageBucket())) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_FILE)
    if (error) {
      if (error.message.includes('not found') || error.message.includes('Object not found')) {
        return STATS_SEED
      }
      console.error('stats storage read:', error.message)
      return null
    }
    const parsed = parseCount(JSON.parse(await data.text())?.count)
    return parsed ?? STATS_SEED
  } catch (e) {
    console.error('stats storage read exception:', e)
    return null
  }
}

async function storageIncrement(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  if (!(await ensureStorageBucket())) return null
  try {
    const current = (await storageGet()) ?? STATS_SEED
    const next = Math.max(current, STATS_SEED) + 1
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE, JSON.stringify({ count: next }), {
        upsert: true,
        contentType: 'application/json',
      })
    if (error) {
      console.error('stats storage write:', error.message)
      return null
    }
    return next
  } catch (e) {
    console.error('stats storage increment exception:', e)
    return null
  }
}

async function supabaseTableGet(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('app_stats')
      .select('value')
      .eq('key', 'roast_count')
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error.message)) return null
      console.error('supabase stats read:', error.message)
      return null
    }
    const parsed = parseCount(data?.value)
    return parsed ?? STATS_SEED
  } catch (e) {
    console.error('supabase stats read exception:', e)
    return null
  }
}

async function supabaseTableIncrement(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()

    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_roast_count')
    if (!rpcError && rpcData != null) {
      const count = parseCount(rpcData)
      if (count !== null) return Math.max(count, STATS_SEED)
    } else if (rpcError && !isMissingTableError(rpcError.message) && !rpcError.message.includes('Could not find the function')) {
      console.error('supabase stats rpc:', rpcError.message)
    }

    const { data: row, error: readError } = await supabase
      .from('app_stats')
      .select('value')
      .eq('key', 'roast_count')
      .maybeSingle()

    if (readError) {
      if (isMissingTableError(readError.message)) return null
      console.error('supabase stats increment read:', readError.message)
      return null
    }

    const current = parseCount(row?.value) ?? STATS_SEED
    const next = Math.max(current, STATS_SEED) + 1

    const { data, error } = await supabase
      .from('app_stats')
      .upsert({ key: 'roast_count', value: next }, { onConflict: 'key' })
      .select('value')
      .single()

    if (error) {
      console.error('supabase stats increment write:', error.message)
      return null
    }

    const count = parseCount(data?.value)
    if (count === null) return null
    return Math.max(count, STATS_SEED)
  } catch (e) {
    console.error('supabase stats increment exception:', e)
    return null
  }
}

export async function getStatsCount(): Promise<number> {
  const fromTable = await supabaseTableGet()
  if (fromTable !== null) {
    const count = Math.max(fromTable, STATS_SEED)
    global.roastCount = count
    return count
  }

  const fromStorage = await storageGet()
  if (fromStorage !== null) {
    const count = Math.max(fromStorage, STATS_SEED)
    global.roastCount = count
    return count
  }

  const fromKv = await kvGet()
  if (fromKv !== null) {
    const count = Math.max(fromKv, STATS_SEED)
    global.roastCount = count
    return count
  }

  return memoryCount()
}

export async function incrementStatsCount(): Promise<number> {
  const fromTable = await supabaseTableIncrement()
  if (fromTable !== null) {
    global.roastCount = fromTable
    return fromTable
  }

  const fromStorage = await storageIncrement()
  if (fromStorage !== null) {
    global.roastCount = fromStorage
    return fromStorage
  }

  if (await kvAvailable()) {
    try {
      const { kv } = await import('@vercel/kv')
      const existing = await kv.get<number>('mycvroast:roast_count')
      if (existing === null) {
        const initial = STATS_SEED + 1
        await kv.set('mycvroast:roast_count', initial)
        global.roastCount = initial
        return initial
      }
      const next = await kv.incr('mycvroast:roast_count')
      global.roastCount = Math.max(parseCount(next) ?? STATS_SEED, STATS_SEED)
      return global.roastCount
    } catch {
      /* fall through to memory */
    }
  }

  global.roastCount = memoryCount() + 1
  return global.roastCount
}
