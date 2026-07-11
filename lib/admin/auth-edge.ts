const SALT = ':mycvroast-admin-v1'

export const ADMIN_COOKIE = 'admin_session'

async function hashSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${secret}${SALT}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function getAdminSessionTokenEdge(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD_BCRYPT ?? process.env.ADMIN_PASSWORD
  if (!secret) return null
  return hashSecret(secret)
}

export async function verifyAdminSessionEdge(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const expected = await getAdminSessionTokenEdge()
  if (!expected) return false
  return timingSafeHexEqual(token, expected)
}
