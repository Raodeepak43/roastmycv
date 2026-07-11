import { readFileSync } from 'fs'
import { join } from 'path'
import { withPostgresClient } from '@/lib/db/postgres-client'

let ensured = false

/** Apply dashboard tables when POSTGRES_URL is available (Vercel Supabase integration). */
export async function ensureDashboardTables(): Promise<boolean> {
  if (ensured) return true

  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) return false

  try {
    await withPostgresClient(url, async (client) => {
      const sql = readFileSync(join(process.cwd(), 'scripts/migrate-user-tables.sql'), 'utf8')
      await client.query(sql)
      await client.query(`
        ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
        ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS resume_ai_used INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS resume_pdf_used INTEGER NOT NULL DEFAULT 0;
      `)
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_tool_results (
          id TEXT PRIMARY KEY,
          user_id UUID NOT NULL,
          tool_slug TEXT NOT NULL,
          title TEXT,
          input_summary TEXT,
          result_text TEXT NOT NULL,
          result_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_user_tool_results_user_created ON user_tool_results (user_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_user_tool_results_user_tool ON user_tool_results (user_id, tool_slug, created_at DESC);
        ALTER TABLE user_tool_results ENABLE ROW LEVEL SECURITY;
      `)
    })
    ensured = true
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'ensureDashboardTables failed'
    console.error('[ensureDashboardTables]', message)
    return false
  }
}
