import { createHash } from 'crypto'

type StoredValue = { value: string; expiresAt: number }

declare global {
  // eslint-disable-next-line no-var
  var authMemoryStore: Map<string, StoredValue> | undefined
}

function memoryMap(): Map<string, StoredValue> {
  if (!global.authMemoryStore) global.authMemoryStore = new Map()
  return global.authMemoryStore
}

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvGet(key: string): Promise<string | null> {
  if (!kvConfigured()) return null
  try {
    const { kv } = await import('@vercel/kv')
    const val = await kv.get<string>(key)
    return val ?? null
  } catch {
    return null
  }
}

async function kvSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!kvConfigured()) return
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value, { ex: ttlSeconds })
  } catch {
    /* fall back to memory */
  }
}

async function kvDel(key: string): Promise<void> {
  if (!kvConfigured()) return
  try {
    const { kv } = await import('@vercel/kv')
    await kv.del(key)
  } catch {
    /* noop */
  }
}

function memoryGet(key: string): string | null {
  const entry = memoryMap().get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryMap().delete(key)
    return null
  }
  return entry.value
}

function memorySet(key: string, value: string, ttlSeconds: number): void {
  memoryMap().set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

function memoryDel(key: string): void {
  memoryMap().delete(key)
}

export async function authStoreGet(key: string): Promise<string | null> {
  const fromKv = await kvGet(key)
  if (fromKv !== null) return fromKv
  return memoryGet(key)
}

export async function authStoreSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  memorySet(key, value, ttlSeconds)
  await kvSet(key, value, ttlSeconds)
}

export async function authStoreDel(key: string): Promise<void> {
  memoryDel(key)
  await kvDel(key)
}

export function hashAuthKey(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex').slice(0, 32)
}
