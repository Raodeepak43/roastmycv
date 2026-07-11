import { AUTH_COOKIE_DOMAIN } from '@/lib/site/hosts'

type CookieOptions = {
  domain?: string
  path?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
  httpOnly?: boolean
  maxAge?: number
  expires?: Date
}

/** Share Supabase session across www + dashboard via `.mycvroast.in` in production. */
export function mergeAuthCookieOptions(options?: CookieOptions): CookieOptions {
  return {
    ...options,
    path: options?.path ?? '/',
    sameSite: options?.sameSite ?? 'lax',
    secure: options?.secure ?? process.env.NODE_ENV === 'production',
    ...(AUTH_COOKIE_DOMAIN ? { domain: AUTH_COOKIE_DOMAIN } : {}),
  }
}
