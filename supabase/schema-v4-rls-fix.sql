ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cached_jobs_public_read" ON cached_jobs FOR SELECT USING (true);
CREATE POLICY "cached_jobs_service_write" ON cached_jobs FOR ALL USING (auth.role() = 'service_role');
