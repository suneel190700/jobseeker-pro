export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const THEIRSTACK_BASE = 'https://api.theirstack.com/v1';
const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';
const CACHE_HOURS = 1;

interface MappedJob { id:string; title:string; company:string; location:string; remote_type:string; description:string; salary_min:number|null; salary_max:number|null; posted_date:string; source_url:string; source:string; employment_type:string; }

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software engineer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote') === 'true';
    const datePosted = searchParams.get('date_posted') || '';
    const employmentType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');

    const cacheKey = `${query.toLowerCase().trim()}|${location.toLowerCase().trim()}|${remote}|${datePosted}|${employmentType}|${page}`;

    // Check cache
    const sb = getSupabase();
    if (sb) {
      try {
        const expiry = new Date(Date.now() - CACHE_HOURS * 3600000).toISOString();
        const { data: cached } = await sb.from('cached_jobs').select('*').eq('query_key', cacheKey).gte('fetched_at', expiry).order('posted_date', { ascending: false });
        if (cached && cached.length >= 5 && cached.some((j: any) => j.description && j.description.length > 50)) {
          console.log(`Cache HIT: ${cached.length} jobs`);
          return NextResponse.json({ jobs: cached.map(mapCached), count: cached.length, page, hasMore: cached.length >= 10, source: 'cache' });
        }
      } catch (e) { console.error('Cache read error:', e); }
    }

    // Fetch from available sources
    const fetches: Promise<MappedJob[]>[] = [];
    if (process.env.THEIRSTACK_API_KEY) fetches.push(fetchTheirStack(query, location, remote, datePosted, employmentType, page));
    if (process.env.RAPIDAPI_KEY) fetches.push(fetchJSearch(query, location, remote, datePosted, employmentType, page));
    if (fetches.length === 0) return NextResponse.json({ error: 'No job API configured. Add THEIRSTACK_API_KEY or RAPIDAPI_KEY.', jobs: [] }, { status: 503 });

    const results = await Promise.allSettled(fetches);
    let allJobs: MappedJob[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') { console.log(`Source: ${r.value.length} jobs`); allJobs.push(...r.value); }
      else console.error('Fetch failed:', r.reason?.message);
    }

    // Dedup
    const seen = new Set<string>();
    const unique: MappedJob[] = [];
    for (const j of allJobs) {
      const k = `${j.title.toLowerCase().replace(/[^a-z0-9]/g,'')}|${j.company.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
      if (!seen.has(k)) { seen.add(k); unique.push(j); }
    }

    // Cache
    if (sb && unique.length > 0) cacheJobs(sb, cacheKey, unique).catch(e => console.error('Cache write:', e));

    return NextResponse.json({ jobs: unique, count: unique.length, page, hasMore: unique.length >= 10 });
  } catch (e: any) { console.error('Search error:', e); return NextResponse.json({ error: 'Failed', jobs: [] }, { status: 500 }); }
}

// === THEIRSTACK ===
async function fetchTheirStack(query: string, location: string, remote: boolean, datePosted: string, employmentType: string, page: number): Promise<MappedJob[]> {
  try {
    const body: any = { page: page - 1, limit: 15, job_title_or: [query], posted_at_max_age_days: 30, order_by: [{ desc: true, field: 'date_posted' }], include_total_results: true, blur_company_data: false };
    if (location) body.job_location_pattern_or = [location]; else body.job_country_code_or = ['US'];
    if (remote) body.remote = true;
    if (datePosted === 'today') body.posted_at_max_age_days = 1;
    else if (datePosted === '3days') body.posted_at_max_age_days = 3;
    else if (datePosted === 'week') body.posted_at_max_age_days = 7;
    if (employmentType) { const m: Record<string,string> = { fulltime:'full-time', parttime:'part-time', contract:'contract' }; if (m[employmentType]) body.job_type_or = [m[employmentType]]; }

    const r = await fetch(`${THEIRSTACK_BASE}/jobs/search`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.THEIRSTACK_API_KEY}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    if (!r.ok) { console.error('TheirStack:', r.status); return []; }
    const data = await r.json();
    if (data.data?.[0]) { const f = data.data[0]; console.log('TS sample:', JSON.stringify({ keys: Object.keys(f).join(','), desc_len: (f.description||'').length, jd_len: (f.job_description||'').length, body_len: (f.body||'').length, text_desc: (f.text_description||'').length, html_desc: (f.html_description||'').length }).slice(0,500)); }
    return (data.data || []).map((item: any): MappedJob => ({
      id: `ts_${item.id || Math.random().toString(36).slice(2)}`,
      title: item.job_title || item.title || 'Untitled',
      company: item.company_name || item.company_object?.name || item.company?.name || (typeof item.company === 'string' ? item.company : '') || 'Unknown',
      location: item.location || item.job_location || 'US',
      remote_type: item.remote ? 'remote' : 'onsite',
      description: item.description || item.job_description || item.job_description_text || item.html_description || item.text_description || item.body || item.content || '',
      salary_min: item.min_annual_salary ? Math.round(item.min_annual_salary / 1000) * 1000 : null,
      salary_max: item.max_annual_salary ? Math.round(item.max_annual_salary / 1000) * 1000 : null,
      posted_date: item.date_posted || item.discovered_at || new Date().toISOString(),
      source_url: item.url || item.apply_url || item.job_url || '#',
      source: 'TheirStack',
      employment_type: item.job_type || '',
    }));
  } catch (e: any) { console.error('TheirStack error:', e.message); return []; }
}

// === JSEARCH ===
async function fetchJSearch(query: string, location: string, remote: boolean, datePosted: string, employmentType: string, page: number): Promise<MappedJob[]> {
  try {
    const p = new URLSearchParams({ query: location ? `${query} in ${location}` : query, page: String(page), num_pages: '1' });
    if (datePosted) p.set('date_posted', datePosted);
    if (remote) p.set('remote_jobs_only', 'true');
    if (employmentType) p.set('employment_types', employmentType.toUpperCase());
    const r = await fetch(`${JSEARCH_BASE}/search?${p}`, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' } });
    if (!r.ok) return [];
    const data = await r.json();
    if (data.data?.[0]) { const f = data.data[0]; console.log('JSearch sample:', JSON.stringify({ keys: Object.keys(f).join(','), job_description_len: (f.job_description||'').length, job_highlights: !!f.job_highlights, job_description_start: (f.job_description||'').slice(0,100) }).slice(0,500)); }
    return (data.data || []).map((item: any): MappedJob => ({
      id: item.job_id || `js_${Math.random().toString(36).slice(2)}`,
      title: item.job_title || 'Untitled',
      company: item.employer_name || 'Unknown',
      location: item.job_city ? `${item.job_city}, ${item.job_state || ''}` : 'US',
      remote_type: item.job_is_remote ? 'remote' : 'onsite',
      description: item.job_description || item.job_highlights?.Qualifications?.join('\n') || item.job_highlights?.Responsibilities?.join('\n') || '',
      salary_min: item.job_min_salary, salary_max: item.job_max_salary,
      posted_date: item.job_posted_at_datetime_utc || new Date().toISOString(),
      source_url: item.job_apply_link || item.job_google_link || '#',
      source: 'JSearch',
      employment_type: item.job_employment_type || '',
    }));
  } catch (e: any) { console.error('JSearch error:', e.message); return []; }
}

function mapCached(row: any): MappedJob {
  return { id: row.id, title: row.title, company: row.company, location: row.location || 'US', remote_type: row.remote_type || 'onsite', description: row.description || '', salary_min: row.salary_min, salary_max: row.salary_max, posted_date: row.posted_date || row.fetched_at, source_url: row.source_url || '#', source: row.source || 'cached', employment_type: row.employment_type || '' };
}

async function cacheJobs(sb: any, key: string, jobs: MappedJob[]) {
  await sb.from('cached_jobs').delete().eq('query_key', key);
  const rows = jobs.map(j => ({ id: j.id, query_key: key, title: j.title, company: j.company, location: j.location, remote_type: j.remote_type, description: j.description, salary_min: j.salary_min, salary_max: j.salary_max, posted_date: j.posted_date, source_url: j.source_url, source: j.source, employment_type: j.employment_type, fetched_at: new Date().toISOString() }));
  await sb.from('cached_jobs').upsert(rows, { onConflict: 'id' });
  console.log(`Cached ${rows.length} jobs`);
}
