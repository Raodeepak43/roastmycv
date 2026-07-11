/** Google OAuth via Supabase stores photo in avatar_url or picture. */
export function resolveAvatarUrl(metadata?: Record<string, unknown> | null): string | null {
  if (!metadata) return null
  const raw = metadata.avatar_url ?? metadata.picture
  if (typeof raw !== 'string') return null
  const url = raw.trim()
  return url.length > 0 ? url : null
}

export function userInitials(name: string, email: string): string {
  const base = name.trim() || email.split('@')[0] || 'U'
  return base.slice(0, 2).toUpperCase()
}
