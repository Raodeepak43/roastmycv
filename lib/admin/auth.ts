import { createHash } from 'crypto'
import { safeHexEqual } from '@/lib/auth/password'

export const ADMIN_COOKIE = 'admin_session'

export function getAdminSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD
  const bcryptHash = process.env.ADMIN_PASSWORD_BCRYPT
  const secret = bcryptHash ?? password
  if (!secret) return null
  return createHash('sha256').update(`${secret}:mycvroast-admin-v1`).digest('hex')
}

export function verifyAdminSession(token: string | undefined | null): boolean {
  if (!token) return false
  const expected = getAdminSessionToken()
  if (!expected) return false
  return safeHexEqual(token, expected)
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim())
}
