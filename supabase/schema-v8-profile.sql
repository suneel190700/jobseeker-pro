-- Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_title text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_expectation text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_authorization text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'US';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_year text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gpa text DEFAULT '';
