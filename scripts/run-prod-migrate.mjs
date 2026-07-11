/**
 * Apply DB schema on production (uses ADMIN_PASSWORD from .env.local).
 * Usage: node scripts/run-prod-migrate.mjs
 */
import { readFileSync, existsSync } from 'fs'

const SITE = process.env.MIGRATE_SITE_URL || 'https://www.mycvroast.in'

for (const file of ['.env.local', '.env.production.local']) {
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

const password = process.env.ADMIN_PASSWORD
if (!password) {
  console.error('Missing ADMIN_PASSWORD in .env.local')
  process.exit(1)
}

const loginRes = await fetch(`${SITE}/api/admin/auth`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
})

const setCookie = loginRes.headers.get('set-cookie') ?? ''
const cookie = setCookie.split(';')[0]
if (!loginRes.ok || !cookie) {
  console.error('Admin login failed:', loginRes.status, await loginRes.text())
  process.exit(1)
}

console.log('Admin authenticated')

const migrateRes = await fetch(`${SITE}/api/admin/migrate-db`, {
  method: 'POST',
  headers: { Cookie: cookie },
})

const body = await migrateRes.json()
if (!migrateRes.ok) {
  console.error('Migration failed:', body.error ?? body)
  process.exit(1)
}

console.log('✅', body.message ?? 'Schema applied on production')

const checkRes = await fetch(`${SITE}/api/admin/migrate-db`, {
  headers: { Cookie: cookie },
})
const check = await checkRes.json()
console.log('Postgres configured:', check.postgresConfigured)
