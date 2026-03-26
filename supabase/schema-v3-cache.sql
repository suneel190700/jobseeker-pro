-- Run this in Supabase SQL Editor
-- Cached jobs table for 1-hour smart caching
CREATE TABLE IF NOT EXISTS cached_jobs (
  id TEXT PRIMARY KEY,
  query_key TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  remote_type TEXT DEFAULT 'onsite',
  description TEXT DEFAULT '',
  salary_min INTEGER,
  salary_max INTEGER,
  posted_date TIMESTAMPTZ,
  source_url TEXT DEFAULT '#',
  source TEXT DEFAULT 'TheirStack',
  employment_type TEXT DEFAULT '',
  raw_data JSONB DEFAULT '{}',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cached_jobs_query ON cached_jobs(query_key);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_fetched ON cached_jobs(fetched_at);

-- No RLS needed - cached jobs are public/shared across users

-- RLS Fix
ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cached_jobs_public_read" ON cached_jobs FOR SELECT USING (true);
CREATE POLICY "cached_jobs_service_write" ON cached_jobs FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS
ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cached_jobs_public_read" ON cached_jobs FOR SELECT USING (true);
CREATE POLICY "cached_jobs_service_write" ON cached_jobs FOR ALL USING (auth.role() = 'service_role');

-- RLS Fix
ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cached_jobs_public_read" ON cached_jobs FOR SELECT USING (true);
CREATE POLICY "cached_jobs_service_write" ON cached_jobs FOR ALL USING (auth.role() = 'service_role');
