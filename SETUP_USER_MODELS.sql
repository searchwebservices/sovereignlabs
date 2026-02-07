-- ============================================================
-- Setup: user_models table for persistent model selection
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS user_models (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  model_id   TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider   TEXT NOT NULL,
  action     TEXT NOT NULL CHECK (action IN ('add', 'remove', 'select')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_user_models_user_id ON user_models (user_id);
CREATE INDEX IF NOT EXISTS idx_user_models_user_action ON user_models (user_id, action);

-- RLS: users can only access their own rows
ALTER TABLE user_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own models"
  ON user_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own models"
  ON user_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own models"
  ON user_models FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Verify
-- ============================================================
SELECT 'user_models' AS entity, COUNT(*) AS count FROM user_models;
