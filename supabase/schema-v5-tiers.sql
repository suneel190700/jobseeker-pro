-- Run in Supabase SQL Editor

-- User tiers table
CREATE TABLE IF NOT EXISTS user_tiers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','paid','custom')),
  daily_ai_limit INTEGER NOT NULL DEFAULT 5,
  daily_search_limit INTEGER NOT NULL DEFAULT 10,
  daily_mock_limit INTEGER NOT NULL DEFAULT 3,
  daily_download_limit INTEGER NOT NULL DEFAULT 2,
  ai_used_today INTEGER NOT NULL DEFAULT 0,
  search_used_today INTEGER NOT NULL DEFAULT 0,
  mock_used_today INTEGER NOT NULL DEFAULT 0,
  download_used_today INTEGER NOT NULL DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_tier" ON user_tiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_manage_tiers" ON user_tiers FOR ALL USING (auth.role() = 'service_role');

-- Auto-create tier row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tiers (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_tier ON auth.users;
CREATE TRIGGER on_auth_user_created_tier
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_tier();

-- Fix cached_jobs RLS
ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cached_jobs_public_read" ON cached_jobs;
DROP POLICY IF EXISTS "cached_jobs_service_write" ON cached_jobs;
CREATE POLICY "cached_jobs_public_read" ON cached_jobs FOR SELECT USING (true);
CREATE POLICY "cached_jobs_service_write" ON cached_jobs FOR INSERT USING (true);
CREATE POLICY "cached_jobs_service_update" ON cached_jobs FOR UPDATE USING (true);
CREATE POLICY "cached_jobs_service_delete" ON cached_jobs FOR DELETE USING (true);
