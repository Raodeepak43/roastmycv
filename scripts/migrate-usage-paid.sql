-- Run once in Supabase SQL Editor if usage_limits already exists without paid column
ALTER TABLE usage_limits ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false;
