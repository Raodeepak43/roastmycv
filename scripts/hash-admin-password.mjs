#!/usr/bin/env node
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-admin-password.mjs <password>')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log('\nAdd to Vercel / .env.local:\n')
console.log(`ADMIN_PASSWORD_BCRYPT=${hash}`)
console.log('\nRemove ADMIN_PASSWORD after verifying login works.\n')
