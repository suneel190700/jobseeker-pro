import { createClient } from '@/lib/supabase/client';

// ---- Base Resume (stored in profiles table) ----

export async function getBaseResume(): Promise<{ fileName: string; text: string; uploadedAt: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('resumes')
    .select('file_name, raw_text, created_at')
    .eq('user_id', user.id)
    .eq('version_label', 'base')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data || !data.raw_text) return null;
  return { fileName: data.file_name, text: data.raw_text, uploadedAt: data.created_at };
}

export async function saveBaseResume(fileName: string, text: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Upsert — delete old base resume, insert new
  await supabase.from('resumes').delete().eq('user_id', user.id).eq('version_label', 'base');

  const { error } = await supabase.from('resumes').insert({
    user_id: user.id,
    file_name: fileName,
    file_url: '',
    raw_text: text,
    status: 'parsed',
    version_label: 'base',
  });

  return !error;
}

export async function deleteBaseResume(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('resumes').delete().eq('user_id', user.id).eq('version_label', 'base');
  return !error;
}

// ---- Applications (Tracker Cards) ----

export interface TrackerCard {
  id: string;
  company: string;
  title: string;
  stage: string;
  applied_date: string;
  notes: string;
  url: string;
  location?: string;
  salary?: string;
  match_score?: number;
  match_reason?: string;
}

export async function getTrackerCards(): Promise<TrackerCard[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('applications')
    .select(`
      id, stage, applied_date, follow_up_date, salary_offered, contacts, created_at, updated_at,
      saved_jobs (id, title, company, location, remote_type, description, salary_min, salary_max, source_url, match_score)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (!data) return [];

  return data.map((app: any) => ({
    id: app.id,
    company: app.saved_jobs?.company || '',
    title: app.saved_jobs?.title || '',
    stage: app.stage || 'saved',
    applied_date: app.applied_date || '',
    notes: '',
    url: app.saved_jobs?.source_url || '',
    location: app.saved_jobs?.location || '',
    salary: app.salary_offered ? `$${app.salary_offered}` : '',
    match_score: app.saved_jobs?.match_score,
  }));
}

export async function addTrackerCard(card: Omit<TrackerCard, 'id'>): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // First create saved_job
  const { data: job, error: jobError } = await supabase.from('saved_jobs').insert({
    user_id: user.id,
    title: card.title,
    company: card.company,
    location: card.location || '',
    source_url: card.url,
    match_score: card.match_score,
  }).select('id').single();

  if (jobError || !job) {
    console.error('Failed to save job:', jobError);
    return null;
  }

  // Then create application
  const { data: app, error: appError } = await supabase.from('applications').insert({
    user_id: user.id,
    job_id: job.id,
    stage: card.stage || 'saved',
    applied_date: card.applied_date || null,
  }).select('id').single();

  if (appError) {
    console.error('Failed to create application:', appError);
    return null;
  }

  return app.id;
}

export async function updateTrackerStage(appId: string, stage: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('applications')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', appId);
  return !error;
}

export async function deleteTrackerCard(appId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('applications').delete().eq('id', appId);
  return !error;
}

export async function updateJobMatchScore(jobUrl: string, score: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('saved_jobs')
    .update({ match_score: score })
    .eq('user_id', user.id)
    .eq('source_url', jobUrl);
  return !error;
}

// ---- Job Scores Cache (localStorage for non-saved jobs) ----

const SCORE_CACHE_KEY = 'jobseeker_score_cache';

export function getCachedScores(): Record<string, { score: number; reason: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SCORE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function setCachedScore(jobId: string, score: number, reason: string) {
  if (typeof window === 'undefined') return;
  try {
    const cache = getCachedScores();
    cache[jobId] = { score, reason };
    localStorage.setItem(SCORE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
