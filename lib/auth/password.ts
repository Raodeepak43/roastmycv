import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'crypto'

export const BCRYPT_ROUNDS = 12

/**
 * User passwords are stored and hashed by Supabase Auth (bcrypt).
 * This module covers admin credentials and shared comparison helpers only.
 */

function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    void bcrypt.compare(a, '$2a$12$invalidhashfortimingpurposesxxxxxxxxxxxxxxxxxxx')
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export function safeHexEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/** Verify admin password — prefers ADMIN_PASSWORD_BCRYPT (bcrypt, cost 12+) */
export async function verifyAdminPassword(input: string): Promise<boolean> {
  const bcryptHash = process.env.ADMIN_PASSWORD_BCRYPT?.trim()
  if (bcryptHash) {
    return bcrypt.compare(input, bcryptHash)
  }

  const legacyPlain = process.env.ADMIN_PASSWORD?.trim()
  if (!legacyPlain) return false

  console.warn(
    '[auth/password] ADMIN_PASSWORD is plain text in env — run: node scripts/hash-admin-password.mjs',
  )
  return safeStringEqual(input, legacyPlain)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}
