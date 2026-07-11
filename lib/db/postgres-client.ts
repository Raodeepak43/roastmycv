import pg from 'pg'

function isLocalPostgres(url: string) {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

/** Supabase/Vercel often need relaxed TLS — pg ssl options alone may not suffice on Node 18+. */
function withTlsRelaxed<T>(fn: () => Promise<T>): Promise<T> {
  const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  return fn().finally(() => {
    if (prev === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev
  })
}

export function createPostgresClient(url: string) {
  const local = isLocalPostgres(url)
  return new pg.Client({
    connectionString: url,
    ssl: local
      ? false
      : {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
        },
  })
}

export async function withPostgresClient<T>(
  url: string,
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = createPostgresClient(url)
  return withTlsRelaxed(async () => {
    await client.connect()
    try {
      return await fn(client)
    } finally {
      await client.end().catch(() => undefined)
    }
  })
}
