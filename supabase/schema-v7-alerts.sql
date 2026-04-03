-- Add active and last_sent columns to job_alerts if they don't exist
ALTER TABLE job_alerts ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE job_alerts ADD COLUMN IF NOT EXISTS last_sent timestamptz;

-- Ensure profiles has email column accessible
-- (email comes from auth.users, but we need it in profiles for joins)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Create digest preferences table
CREATE TABLE IF NOT EXISTS digest_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  weekly_digest boolean DEFAULT true,
  job_alerts boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
