/**
 * Apply dashboard user tables when POSTGRES_URL is available.
 *
 * Usage:
 *   POSTGRES_URL_NON_POOLING="postgresql://..." node scripts/migrate-user-tables.mjs
 *
 * Or paste scripts/migrate-user-tables.sql in Supabase SQL Editor.
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
      if (val && !process.env[key]) process.env[key] = val
    }
  }
}

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
if (!url) {
  console.error('Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL.')
  console.error('')
  console.error('Option A — Supabase SQL Editor (fastest):')
  console.error('  https://supabase.com/dashboard/project/rrtokbvxauxsgtjmuqof/sql/new')
  console.error('  Paste contents of scripts/migrate-user-tables.sql and click Run')
  console.error('')
  console.error('Option B — CLI with connection string:')
  console.error('  POSTGRES_URL_NON_POOLING="postgresql://..." node scripts/migrate-user-tables.mjs')
  process.exit(1)
}

const sqlSchema = readFileSync('scripts/supabase-schema.sql', 'utf8')
const sqlUser = readFileSync('scripts/migrate-user-tables.sql', 'utf8')
const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const client = new pg.Client({
  connectionString: url,
  ssl: url.includes('localhost') ? false : { rejectUnauthorized: false, checkServerIdentity: () => undefined },
})

try {
  await client.connect()
  try {
    await client.query(sqlSchema)
    console.log('✅ Base schema applied')
  } catch (err) {
    console.warn('⚠️ Base schema partial:', err.message)
  }
  await client.query(sqlUser)
  try {
    await client.query(readFileSync('scripts/post-migrate-grants.sql', 'utf8'))
    console.log('✅ API grants + schema reload applied')
  } catch (err) {
    console.warn('⚠️ Post-migrate grants partial:', err.message)
  }
  console.log('✅ Dashboard tables created: user_usage, user_roasts, user_payments')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
} finally {
  if (prevTls === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
  else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls
  await client.end()
}
