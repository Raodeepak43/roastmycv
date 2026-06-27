import { createHash } from 'crypto'

export const ADMIN_COOKIE = 'admin_session'

export function getAdminSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return createHash('sha256').update(`${password}:mycvroast-admin-v1`).digest('hex')
}

export function verifyAdminSession(token: string | undefined | null): boolean {
  if (!token) return false
  const expected = getAdminSessionToken()
  if (!expected) return false
  return token === expected
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim())
}
