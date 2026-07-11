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
  paid BOOLEAN NOT NULL DEFAULT false,
  linkedin_used_count INTEGER NOT NULL DEFAULT 0 CHECK (linkedin_used_count >= 0),
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

-- Per-user usage (dashboard — persists across devices)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY,
  roasts_used INTEGER NOT NULL DEFAULT 0 CHECK (roasts_used >= 0),
  resume_ai_used INTEGER NOT NULL DEFAULT 0 CHECK (resume_ai_used >= 0),
  resume_pdf_used INTEGER NOT NULL DEFAULT 0 CHECK (resume_pdf_used >= 0),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved roast history for logged-in users
CREATE TABLE IF NOT EXISTS user_roasts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  title TEXT,
  verdict TEXT,
  intensity TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hinglish',
  file_name TEXT,
  roast_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roasts_user_created ON user_roasts (user_id, created_at DESC);

-- Pro payment receipts (dashboard billing)
CREATE TABLE IF NOT EXISTS user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  amount_inr INTEGER NOT NULL CHECK (amount_inr > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_payments_user_created ON user_payments (user_id, created_at DESC);

-- Shareable public roast cards (no CV text / PII)
CREATE TABLE IF NOT EXISTS public_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  intensity TEXT NOT NULL CHECK (intensity IN ('clean', 'gaali_light', 'savage')),
  language TEXT NOT NULL,
  summary TEXT NOT NULL,
  top_issues TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  share_token TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_public_roasts_token ON public_roasts (share_token);
CREATE INDEX IF NOT EXISTS idx_public_roasts_public_created ON public_roasts (is_public, created_at DESC);

-- Dashboard AI tool usage (daily or lifetime per tool)
CREATE TABLE IF NOT EXISTS user_tool_usage (
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  period_key TEXT NOT NULL DEFAULT 'lifetime',
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tool_slug, period_key)
);

-- Job application tracker (dashboard)
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  notes TEXT,
  job_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_date ON job_applications (user_id, date_applied DESC);

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

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_results ENABLE ROW LEVEL SECURITY;
