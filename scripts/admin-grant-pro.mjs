/**
 * One-off: grant Pro to a user by email (uses Supabase service role).
 *
 * Usage:
 *   node scripts/admin-grant-pro.mjs clashingadda43@gmail.com
 */
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
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

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node scripts/admin-grant-pro.mjs user@email.com')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function ensureTablesViaPg() {
  const pgUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!pgUrl) return false
  const client = new pg.Client({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
  })
  try {
    await client.connect()
    await client.query(readFileSync('scripts/migrate-user-tables.sql', 'utf8'))
    return true
  } catch (e) {
    console.error('PG migrate failed:', e instanceof Error ? e.message : e)
    return false
  } finally {
    await client.end().catch(() => undefined)
  }
}

const { data: listData, error: listErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (listErr) {
  console.error('listUsers failed:', listErr.message)
  process.exit(1)
}

const user = (listData?.users ?? []).find((u) => u.email?.toLowerCase() === email)
if (!user) {
  console.error(`No auth user found for ${email}`)
  process.exit(1)
}

console.log(`Found user ${user.id} (${user.email})`)

const { data: existingUser } = await sb.auth.admin.getUserById(user.id)
const meta = (existingUser?.user?.app_metadata ?? {})
const { error: authErr } = await sb.auth.admin.updateUserById(user.id, {
  app_metadata: { ...meta, plan: 'pro' },
})
if (authErr) {
  console.error('auth app_metadata update failed:', authErr.message)
  process.exit(1)
}
console.log('Auth plan set to pro in app_metadata')

const { error: upsertErr } = await sb.from('user_usage').upsert(
  {
    user_id: user.id,
    plan: 'pro',
    roasts_used: 0,
    resume_ai_used: 0,
    resume_pdf_used: 0,
    updated_at: new Date().toISOString(),
  },
  { onConflict: 'user_id' },
)

if (upsertErr) {
  console.warn('user_usage upsert skipped (table may not exist):', upsertErr.message)
  console.log('Trying direct Postgres migration…')
  await ensureTablesViaPg()
}

const { data: row } = await sb.from('user_usage').select('plan').eq('user_id', user.id).maybeSingle()
console.log(`Done — plan is now: ${row?.plan ?? 'unknown'}`)
