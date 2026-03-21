export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';
const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/us/search/1';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '937a7fa3';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || 'b58dd04b479085796120caa7ef7924d7';

interface MappedJob { id:string; title:string; company:string; location:string; remote_type:string; description:string; salary_min:number|null; salary_max:number|null; posted_date:string; source_url:string; source:string; employment_type:string; }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software engineer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote') === 'true';
    const datePosted = searchParams.get('date_posted') || '';
    const employmentType = searchParams.get('type') || '';
    const jobId = searchParams.get('job_id') || '';

    // Single job detail fetch
    if (jobId && process.env.RAPIDAPI_KEY) {
      const p = new URLSearchParams({ job_id: jobId, extended_publisher_details: 'false' });
      const r = await fetch(`${JSEARCH_BASE}/job-details?${p}`, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com' } });
      if (r.ok) { const d = await r.json(); const item = d.data?.[0]; if (item) return NextResponse.json({ job: mapJSearch(item) }); }
      return NextResponse.json({ error: 'Job not found', job: null }, { status: 404 });
    }

    // Parallel fetch from both APIs
    const results = await Promise.allSettled([
      fetchJSearch(query, location, remote, datePosted, employmentType),
      fetchAdzuna(query, location),
    ]);

    let allJobs: MappedJob[] = [];
    for (const r of results) { if (r.status === 'fulfilled' && r.value) allJobs.push(...r.value); }

    // Deduplicate by normalized title + company
    const seen = new Set<string>();
    const unique: MappedJob[] = [];
    for (const job of allJobs) {
      const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g,'')}|${job.company.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
      if (!seen.has(key)) { seen.add(key); unique.push(job); }
    }

    return NextResponse.json({ jobs: unique, count: unique.length });
  } catch (error: any) {
    console.error('Job search error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs.', jobs: [] }, { status: 500 });
  }
}

async function fetchJSearch(query:string, location:string, remote:boolean, datePosted:string, employmentType:string): Promise<MappedJob[]> {
  if (!process.env.RAPIDAPI_KEY) return [];
  try {
    const p = new URLSearchParams({ query: location ? `${query} in ${location}` : query, page: '1', num_pages: '1' });
    if (datePosted) p.set('date_posted', datePosted);
    if (remote) p.set('remote_jobs_only', 'true');
    if (employmentType) p.set('employment_types', employmentType.toUpperCase());
    const r = await fetch(`${JSEARCH_BASE}/search?${p}`, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!, 'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com' } });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map(mapJSearch);
  } catch { return []; }
}

async function fetchAdzuna(query:string, location:string): Promise<MappedJob[]> {
  try {
    const p = new URLSearchParams({ app_id: ADZUNA_APP_ID, app_key: ADZUNA_APP_KEY, results_per_page: '15', what: query, content_type: 'application/json' });
    if (location) p.set('where', location);
    const r = await fetch(`${ADZUNA_BASE}?${p}`);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results || []).map(mapAdzuna);
  } catch { return []; }
}

function mapJSearch(item:any): MappedJob {
  let desc = item.job_description || '';
  if (desc.length < 50 && item.job_highlights) {
    const parts: string[] = [];
    if (item.job_highlights.Qualifications?.length) parts.push('Qualifications:\n' + item.job_highlights.Qualifications.join('\n'));
    if (item.job_highlights.Responsibilities?.length) parts.push('Responsibilities:\n' + item.job_highlights.Responsibilities.join('\n'));
    if (parts.length) desc = parts.join('\n\n');
  }
  return { id: item.job_id || Math.random().toString(36).slice(2), title: item.job_title || 'Untitled', company: item.employer_name || 'Unknown', location: item.job_city ? `${item.job_city}, ${item.job_state||''}` : item.job_country || 'US', remote_type: item.job_is_remote ? 'remote' : 'onsite', description: desc, salary_min: item.job_min_salary, salary_max: item.job_max_salary, posted_date: item.job_posted_at_datetime_utc || new Date().toISOString(), source_url: item.job_apply_link || item.job_google_link || '#', source: 'jsearch', employment_type: item.job_employment_type || '' };
}

function mapAdzuna(item:any): MappedJob {
  return { id: `adz_${item.id || Math.random().toString(36).slice(2)}`, title: item.title || 'Untitled', company: item.company?.display_name || 'Unknown', location: item.location?.display_name || 'US', remote_type: (item.title||'').toLowerCase().includes('remote') ? 'remote' : 'onsite', description: item.description || '', salary_min: item.salary_min || null, salary_max: item.salary_max || null, posted_date: item.created || new Date().toISOString(), source_url: item.redirect_url || '#', source: 'adzuna', employment_type: item.contract_time === 'full_time' ? 'FULLTIME' : item.contract_time || '' };
}
