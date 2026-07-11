-- Dashboard tables only (safe to re-run)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY,
  roasts_used INTEGER NOT NULL DEFAULT 0 CHECK (roasts_used >= 0),
  resume_ai_used INTEGER NOT NULL DEFAULT 0 CHECK (resume_ai_used >= 0),
  resume_pdf_used INTEGER NOT NULL DEFAULT 0 CHECK (resume_pdf_used >= 0),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS user_tool_usage (
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  period_key TEXT NOT NULL DEFAULT 'lifetime',
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tool_slug, period_key)
);

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

CREATE TABLE IF NOT EXISTS user_saved_cv (
  user_id UUID PRIMARY KEY,
  cv_text TEXT NOT NULL,
  file_name TEXT,
  source TEXT NOT NULL DEFAULT 'upload',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- LinkedIn roast fingerprint limit (separate from CV roast count)
ALTER TABLE usage_limits ADD COLUMN IF NOT EXISTS linkedin_used_count INTEGER NOT NULL DEFAULT 0 CHECK (linkedin_used_count >= 0);
