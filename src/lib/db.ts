import { createClient } from '@/lib/supabase/client';

// ========== HELPERS ==========
async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// ========== PROFILE / PERSONAL DETAILS ==========
export async function getProfile() {
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function saveProfile(details: { full_name: string; email: string; phone: string; location: string; linkedin_url: string; github_url: string; target_titles: string[] }) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('profiles').update({
    full_name: details.full_name,
    phone: details.phone,
    location: details.location,
    linkedin_url: details.linkedin_url,
    github_url: details.github_url,
    target_titles: details.target_titles,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);
}

// ========== BASE RESUME ==========
export async function getBaseResume() {
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('resumes').select('*').eq('user_id', user.id).eq('version_label', 'base').order('created_at', { ascending: false }).limit(1).single();
  if (!data) return null;
  return { fileName: data.file_name, text: data.raw_text, uploadedAt: data.created_at };
}

export async function saveBaseResume(fileName: string, text: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('resumes').delete().eq('user_id', user.id).eq('version_label', 'base');
  await supabase.from('resumes').insert({ user_id: user.id, file_name: fileName, file_url: '', raw_text: text, status: 'parsed', version_label: 'base' });
}

export async function deleteBaseResume() {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('resumes').delete().eq('user_id', user.id).eq('version_label', 'base');
}

// ========== RESUME VERSIONS ==========
export async function getResumeVersions() {
  const { supabase, user } = await getUser();
  if (!user) return [];
  const { data } = await supabase.from('resume_versions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return (data || []).map((r: any) => ({
    id: r.id, label: r.label, jobTitle: r.job_title, company: r.company,
    resumeData: r.resume_data, score: r.score, originalScore: r.original_score, createdAt: r.created_at,
  }));
}

export async function saveResumeVersion(label: string, jobTitle: string, company: string, resumeData: any, score: number, originalScore: number) {
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('resume_versions').insert({
    user_id: user.id, label, job_title: jobTitle, company, resume_data: resumeData, score, original_score: originalScore,
  }).select().single();
  return data ? { id: data.id, label, jobTitle, company, resumeData, score, originalScore, createdAt: data.created_at } : null;
}

export async function deleteResumeVersion(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('resume_versions').delete().eq('id', id).eq('user_id', user.id);
}

// ========== TRACKER / APPLICATIONS ==========
export async function getTrackerCards() {
  const { supabase, user } = await getUser();
  if (!user) return [];
  const { data } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return (data || []).map((a: any) => ({
    id: a.id, title: a.title || '', company: a.company || '', stage: a.stage || 'saved',
    date: a.applied_date || a.created_at, url: a.url || '', location: a.location || '',
    salary: a.salary || '', notes: a.notes || '', match_score: a.match_score,
  }));
}

export async function saveTrackerCard(card: { title: string; company: string; stage?: string; url?: string; location?: string; salary?: string; notes?: string; match_score?: number }) {
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('applications').insert({
    user_id: user.id, title: card.title, company: card.company, stage: card.stage || 'saved',
    url: card.url || '', location: card.location || '', salary: card.salary || '',
    notes: card.notes || '', match_score: card.match_score,
  }).select().single();
  return data ? { id: data.id, ...card, stage: card.stage || 'saved', date: data.created_at } : null;
}

export async function updateTrackerCard(id: string, updates: any) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('applications').update({
    ...updates, updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id);
}

export async function deleteTrackerCard(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('applications').delete().eq('id', id).eq('user_id', user.id);
}

// ========== SCORE CACHE ==========
export async function getCachedScores(): Promise<Record<string, { score: number; reason: string }>> {
  const { supabase, user } = await getUser();
  if (!user) return {};
  const { data } = await supabase.from('score_cache').select('*').eq('user_id', user.id);
  const cache: Record<string, { score: number; reason: string }> = {};
  (data || []).forEach((s: any) => { cache[s.job_external_id] = { score: s.score, reason: s.reason }; });
  return cache;
}

export async function setCachedScore(jobId: string, score: number, reason: string, analysisData?: any) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from('score_cache').upsert({
    user_id: user.id, job_external_id: jobId, score, reason, analysis_data: analysisData,
  }, { onConflict: 'user_id,job_external_id' });
}

// ========== BACKWARD COMPAT (localStorage fallback for non-logged-in) ==========
export function getLocalScoreCache(): Record<string, { score: number; reason: string }> {
  try { const r = localStorage.getItem('jobseeker_score_cache'); return r ? JSON.parse(r) : {}; } catch { return {}; }
}

export function setLocalScoreCache(jobId: string, score: number, reason: string) {
  try { const c = getLocalScoreCache(); c[jobId] = { score, reason }; localStorage.setItem('jobseeker_score_cache', JSON.stringify(c)); } catch {}
}
