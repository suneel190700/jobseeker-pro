-- ============================================================
-- JobSeeker Pro — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- User Profiles ----
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  target_role TEXT,
  target_locations TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---- Resumes ----
CREATE TABLE resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  raw_text TEXT DEFAULT '',
  parsed_data JSONB,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'parsing', 'parsed', 'error')),
  version_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);

-- ---- ATS Analyses ----
CREATE TABLE ats_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_description TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  overall_score INTEGER DEFAULT 0,
  keyword_match JSONB DEFAULT '{}',
  section_scores JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ats_user ON ats_analyses(user_id);

-- ---- Saved Jobs ----
CREATE TABLE saved_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote_type TEXT,
  description TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  posted_date TIMESTAMPTZ,
  source_url TEXT,
  source TEXT DEFAULT 'jsearch',
  match_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);

-- ---- Applications ----
CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES saved_jobs(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  stage TEXT DEFAULT 'saved' CHECK (
    stage IN ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')
  ),
  applied_date DATE,
  follow_up_date DATE,
  salary_offered INTEGER,
  contacts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_stage ON applications(user_id, stage);

-- ---- Application Notes ----
CREATE TABLE application_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_app ON application_notes(application_id);

-- ---- Row Level Security ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resumes
CREATE POLICY "Users can CRUD own resumes"
  ON resumes FOR ALL USING (auth.uid() = user_id);

-- ATS Analyses
CREATE POLICY "Users can CRUD own analyses"
  ON ats_analyses FOR ALL USING (auth.uid() = user_id);

-- Saved Jobs
CREATE POLICY "Users can CRUD own saved jobs"
  ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users can CRUD own applications"
  ON applications FOR ALL USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can CRUD own notes"
  ON application_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_notes.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ---- Storage Bucket for Resumes ----
-- Run in Supabase Dashboard > Storage > New Bucket
-- Name: resumes
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain
