import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '@/lib/supabase/env'

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

let adminClient: SupabaseClient | null = null

/** Server-only client (service role). Never expose to the browser. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase is not configured')
  }
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}
