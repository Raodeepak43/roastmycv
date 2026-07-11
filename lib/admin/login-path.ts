/** Server-only — never import from client components. */

/** Example: /manage-k9x2p7v4m8q — 12+ chars, lowercase letters/numbers/hyphens */
const SLUG_RE = /^\/[a-z0-9][a-z0-9-]{11,63}$/

/** Default dev fallback when ADMIN_LOGIN_PATH is unset. */
export const LEGACY_ADMIN_LOGIN_PATH = '/admin/login'

export function getAdminLoginPath(): string {
  const raw = process.env.ADMIN_LOGIN_PATH?.trim()
  if (!raw) return LEGACY_ADMIN_LOGIN_PATH

  const path = (raw.startsWith('/') ? raw : `/${raw}`).toLowerCase()
  if (!SLUG_RE.test(path)) {
    console.warn(
      '[admin] ADMIN_LOGIN_PATH must match /^\\/[a-z0-9][a-z0-9-]{11,63}$/ — falling back to legacy /admin/login',
    )
    return LEGACY_ADMIN_LOGIN_PATH
  }
  return path
}

export function isSecretAdminLoginEnabled(): boolean {
  const raw = process.env.ADMIN_LOGIN_PATH?.trim()
  if (!raw) return false
  const path = (raw.startsWith('/') ? raw : `/${raw}`).toLowerCase()
  return SLUG_RE.test(path)
}

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === getAdminLoginPath()
}
