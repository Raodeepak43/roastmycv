import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseAuthConfigured } from '@/lib/supabase/env'

export { isSupabaseAuthConfigured }

export function createClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    throw new Error('Supabase auth is not configured')
  }
  return createBrowserClient(url, key)
}
