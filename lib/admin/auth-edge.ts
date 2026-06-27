const SALT = ':mycvroast-admin-v1'

export const ADMIN_COOKIE = 'admin_session'

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}${SALT}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getAdminSessionTokenEdge(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return hashPassword(password)
}

export async function verifyAdminSessionEdge(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const expected = await getAdminSessionTokenEdge()
  if (!expected) return false
  return token === expected
}
