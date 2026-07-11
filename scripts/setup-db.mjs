/**
 * Apply MyCVRoast tables to Supabase Postgres.
 *
 * Usage (after env vars are available):
 *   npx vercel env pull .env.production.local --environment=production
 *   node --env-file=.env.production.local scripts/setup-db.mjs
 *
 * Or with .env.local that includes POSTGRES_URL_NON_POOLING or SUPABASE creds + POSTGRES_URL.
 */
import { readFileSync, existsSync } from 'fs'
import pg from 'pg'

const envFiles = ['.env.production.local', '.env.development.local', '.env.local']
for (const file of envFiles) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0) {
      const key = t.slice(0, i).trim()
      const val = t.slice(i + 1).trim().replace(/^"|"$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
}

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
if (!url) {
  console.error('Missing POSTGRES_URL. Run:')
  console.error('  npx vercel env pull .env.production.local --environment=production')
  console.error('  node --env-file=.env.production.local scripts/setup-db.mjs')
  console.error('')
  console.error('Or paste scripts/supabase-schema.sql in Supabase SQL Editor:')
  console.error('  https://supabase.com/dashboard/project/rrtokbvxauxsgtjmuqof/sql/new')
  process.exit(1)
}

const sql = readFileSync('scripts/supabase-schema.sql', 'utf8')
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  await client.query(sql)
  console.log('✅ MyCVRoast schema applied — app_stats, usage_limits, user_usage, user_roasts, email_signups, roast_signups')
} catch (err) {
  console.error('❌ Schema failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
