import { readFileSync } from 'fs'
import { join } from 'path'
import { withPostgresClient } from '@/lib/db/postgres-client'
import { runPostMigrateGrants, waitForApiReady } from '@/lib/db/post-migrate'
import { getDashboardDbStatus } from '@/lib/dashboard/db-health'

export async function runDashboardMigrations(): Promise<{ apiReady: boolean; pgReady: boolean }> {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) {
    throw new Error('POSTGRES_URL not configured')
  }

  await withPostgresClient(url, async (client) => {
    try {
      const schema = readFileSync(join(process.cwd(), 'scripts/supabase-schema.sql'), 'utf8')
      await client.query(schema)
    } catch (err) {
      console.warn('[runDashboardMigrations] supabase-schema partial:', err)
    }

    const userTables = readFileSync(join(process.cwd(), 'scripts/migrate-user-tables.sql'), 'utf8')
    await client.query(userTables)
  })

  await runPostMigrateGrants()

  const apiReady = await waitForApiReady(async () => {
    const status = await getDashboardDbStatus()
    return status.apiReady
  })

  const status = await getDashboardDbStatus()
  return { apiReady, pgReady: status.pgReady }
}

export async function syncPostgrestSchemaOnly(): Promise<{ apiReady: boolean; pgReady: boolean }> {
  await runPostMigrateGrants()
  const apiReady = await waitForApiReady(async () => {
    const status = await getDashboardDbStatus()
    return status.apiReady
  })
  const status = await getDashboardDbStatus()
  return { apiReady, pgReady: status.pgReady }
}
