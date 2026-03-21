-- ============================================================
-- JobSeeker Pro v2 — Additional Schema
-- Run AFTER the original schema.sql
-- ============================================================

-- Add personal details columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_titles TEXT[] DEFAULT '{}';

-- Resume versions table
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Untitled',
  job_title TEXT DEFAULT '',
  company TEXT DEFAULT '',
  resume_data JSONB NOT NULL DEFAULT '{}',
  score INTEGER DEFAULT 0,
  original_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_user ON resume_versions(user_id);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own resume versions"
  ON resume_versions FOR ALL USING (auth.uid() = user_id);

-- Tracker cards (applications already exists but we need url + notes fields)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS url TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS match_score INTEGER;

-- Score cache table
CREATE TABLE IF NOT EXISTS score_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_external_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_external_id)
);

CREATE INDEX IF NOT EXISTS idx_score_cache_user ON score_cache(user_id);
ALTER TABLE score_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own score cache"
  ON score_cache FOR ALL USING (auth.uid() = user_id);

