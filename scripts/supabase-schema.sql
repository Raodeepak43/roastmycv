-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- Global roast counter
CREATE TABLE IF NOT EXISTS app_stats (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 1250
);

INSERT INTO app_stats (key, value) VALUES ('roast_count', 1250)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION increment_roast_count()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE app_stats
  SET value = value + 1
  WHERE key = 'roast_count'
  RETURNING value INTO new_count;

  IF new_count IS NULL THEN
    INSERT INTO app_stats (key, value) VALUES ('roast_count', 1251)
    RETURNING value INTO new_count;
  END IF;

  RETURN new_count;
END;
$$;

-- Free roast limit per browser fingerprint
CREATE TABLE IF NOT EXISTS usage_limits (
  fingerprint TEXT PRIMARY KEY,
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_limits_updated ON usage_limits (updated_at DESC);

-- Email capture (Join modal)
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_signups_created ON email_signups (created_at DESC);

-- Ticker name signups
CREATE TABLE IF NOT EXISTS roast_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  score INTEGER CHECK (score IS NULL OR (score >= 1 AND score <= 10)),
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roast_signups_created ON roast_signups (created_at DESC);

-- Lock down tables: only service role (server) can access
ALTER TABLE app_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE roast_signups ENABLE ROW LEVEL SECURITY;

-- No public policies — API uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
