-- App settings (announcements, maintenance mode)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "service_write_settings" ON app_settings FOR ALL USING (auth.role() = 'service_role');

-- Job alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_alerts" ON job_alerts FOR ALL USING (auth.uid() = user_id);

-- Shared resumes
CREATE TABLE IF NOT EXISTS shared_resumes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shared_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_shared" ON shared_resumes FOR SELECT USING (true);
CREATE POLICY "users_write_shared" ON shared_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
