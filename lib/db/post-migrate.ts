import { readFileSync } from 'fs'
import { join } from 'path'
import { withPostgresClient } from '@/lib/db/postgres-client'

const DASHBOARD_TABLES = [
  'user_usage',
  'user_roasts',
  'user_payments',
  'user_tool_results',
] as const

export async function pgTableExists(tableName: string): Promise<boolean> {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) return false

  try {
    return await withPostgresClient(url, async (client) => {
      const { rows } = await client.query<{ ok: number }>(
        `SELECT 1 AS ok FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1
         LIMIT 1`,
        [tableName],
      )
      return rows.length > 0
    })
  } catch {
    return false
  }
}

export async function runPostMigrateGrants(): Promise<void> {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) return

  const sql = readFileSync(join(process.cwd(), 'scripts/post-migrate-grants.sql'), 'utf8')
  await withPostgresClient(url, async (client) => {
    await client.query(sql)
  })
}

export async function reloadPostgrestSchema(): Promise<void> {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) return

  await withPostgresClient(url, async (client) => {
    await client.query(`NOTIFY pgrst, 'reload schema'`)
  })
}

export async function pgDashboardTablesReady(): Promise<boolean> {
  const checks = await Promise.all(DASHBOARD_TABLES.map((t) => pgTableExists(t)))
  return checks.every(Boolean)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Reload PostgREST cache and poll until Supabase REST sees user_usage (max ~12s). */
export async function waitForApiReady(
  isReady: () => Promise<boolean>,
  attempts = 6,
  delayMs = 2000,
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (await isReady()) return true
    await reloadPostgrestSchema()
    await sleep(delayMs)
  }
  return isReady()
}
