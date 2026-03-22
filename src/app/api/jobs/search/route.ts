export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';

interface MappedJob { id:string; title:string; company:string; location:string; remote_type:string; description:string; salary_min:number|null; salary_max:number|null; posted_date:string; source_url:string; source:string; employment_type:string; }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software engineer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote') === 'true';
    const datePosted = searchParams.get('date_posted') || '';
    const employmentType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const jobId = searchParams.get('job_id') || '';

    // Single job detail (JSearch only)
    if (jobId && process.env.RAPIDAPI_KEY) {
      const p = new URLSearchParams({ job_id: jobId, extended_publisher_details: 'false' });
      const r = await fetch(`${JSEARCH_BASE}/job-details?${p}`, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com' } });
      if (r.ok) { const d = await r.json(); const item = d.data?.[0]; if (item) return NextResponse.json({ job: mapJSearch(item) }); }
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Parallel fetch from JSearch + Apify (if configured)
    const fetches: Promise<MappedJob[]>[] = [];
    if (process.env.RAPIDAPI_KEY) fetches.push(fetchJSearch(query, location, remote, datePosted, employmentType, page));
    if (process.env.APIFY_API_TOKEN) fetches.push(fetchApifyLinkedIn(query, location));
    
    if (fetches.length === 0) return NextResponse.json({ error: 'No job API configured. Add RAPIDAPI_KEY or APIFY_API_TOKEN.', jobs: [] }, { status: 503 });

    const results = await Promise.allSettled(fetches);
    let allJobs: MappedJob[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) { console.log(`Source returned ${r.value.length} jobs`); allJobs.push(...r.value); }
      else if (r.status === 'rejected') { console.error('Job fetch rejected:', r.reason?.message || r.reason); }
    }

    // Deduplicate by title + company
    const seen = new Set<string>();
    const unique: MappedJob[] = [];
    for (const job of allJobs) {
      const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g,'')}|${job.company.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
      if (!seen.has(key)) { seen.add(key); unique.push(job); }
    }

    return NextResponse.json({ jobs: unique, count: unique.length, page, hasMore: unique.length >= 10 });
  } catch (error: any) { console.error('Job search error:', error); return NextResponse.json({ error: 'Failed.', jobs: [] }, { status: 500 }); }
}

// ========== JSEARCH ==========
async function fetchJSearch(query:string, location:string, remote:boolean, datePosted:string, employmentType:string, page:number): Promise<MappedJob[]> {
  try {
    const p = new URLSearchParams({ query: location ? `${query} in ${location}` : query, page: String(page), num_pages: '1' });
    if (datePosted) p.set('date_posted', datePosted);
    if (remote) p.set('remote_jobs_only', 'true');
    if (employmentType) p.set('employment_types', employmentType.toUpperCase());
    const r = await fetch(`${JSEARCH_BASE}/search?${p}`, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!, 'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com' } });
    if (!r.ok) { console.error('JSearch error:', r.status); return []; }
    const d = await r.json();
    return (d.data || []).map(mapJSearch);
  } catch(e) { console.error('JSearch fetch error:', e); return []; }
}

function mapJSearch(item:any): MappedJob {
  let desc = item.job_description || '';
  if (desc.length < 50 && item.job_highlights) {
    const parts: string[] = [];
    if (item.job_highlights.Qualifications?.length) parts.push('Qualifications:\n' + item.job_highlights.Qualifications.join('\n'));
    if (item.job_highlights.Responsibilities?.length) parts.push('Responsibilities:\n' + item.job_highlights.Responsibilities.join('\n'));
    if (parts.length) desc = parts.join('\n\n');
  }
  return { id: item.job_id || `js_${Math.random().toString(36).slice(2)}`, title: item.job_title || 'Untitled', company: item.employer_name || 'Unknown', location: item.job_city ? `${item.job_city}, ${item.job_state || ''}` : item.job_country || 'US', remote_type: item.job_is_remote ? 'remote' : 'onsite', description: desc, salary_min: item.job_min_salary, salary_max: item.job_max_salary, posted_date: item.job_posted_at_datetime_utc || new Date().toISOString(), source_url: item.job_apply_link || item.job_google_link || '#', source: 'JSearch', employment_type: item.job_employment_type || '' };
}

// ========== APIFY LINKEDIN ==========
async function fetchApifyLinkedIn(query:string, location:string): Promise<MappedJob[]> {
  try {
    const token = process.env.APIFY_API_TOKEN!;
    // Use the public LinkedIn jobs scraper actor (no cookies needed)
    const actorId = process.env.APIFY_ACTOR_ID || 'apimaestro~linkedin-jobs-scraper-api';
    
    // Build LinkedIn search URL
    const linkedinQuery = encodeURIComponent(query);
    const linkedinLocation = location ? encodeURIComponent(location) : 'United States';
    
    // Run actor synchronously (wait for results, timeout 25s)
    const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=25`;
    
    const r = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword: query,
        location: location || 'United States',
        maxResults: 15,
        dateSincePosted: 'past month',
        sort: 'recent',
      }),
      signal: AbortSignal.timeout(28000),
    });

    if (!r.ok) {
      console.error('Apify error:', r.status, await r.text().catch(() => ''));
      return [];
    }

    const data = await r.json();
    console.log('Apify returned:', Array.isArray(data) ? data.length : 0, 'jobs');
    
    if (!Array.isArray(data)) return [];
    
    return data.map(mapApifyJob).filter((j): j is MappedJob => j !== null);
  } catch(e: any) {
    console.error('Apify fetch error:', e.message);
    return [];
  }
}

function mapApifyJob(item: any): MappedJob | null {
  if (!item) return null;
  // Different Apify actors return different field names
  const title = item.job_title || item.title || item.jobTitle || '';
  const company = item.company_name || item.company || item.companyName || '';
  if (!title) return null;
  
  return {
    id: `apify_${item.id || item.jobId || Math.random().toString(36).slice(2)}`,
    title,
    company,
    location: item.location || item.jobLocation || 'US',
    remote_type: (title + (item.location || '')).toLowerCase().includes('remote') ? 'remote' : 'onsite',
    description: item.description || item.jobDescription || item.descriptionText || '',
    salary_min: parseSalary(item.salary || item.salaryText, 'min'),
    salary_max: parseSalary(item.salary || item.salaryText, 'max'),
    posted_date: item.date || item.postedDate || item.created || new Date().toISOString(),
    source_url: item.URL || item.url || item.jobUrl || item.link || '#',
    source: 'LinkedIn',
    employment_type: item.job_type || item.jobType || item.employmentType || '',
  };
}

function parseSalary(salary: string | undefined, type: 'min' | 'max'): number | null {
  if (!salary) return null;
  const nums = salary.match(/\$?([\d,]+)/g);
  if (!nums) return null;
  const parsed = nums.map(n => parseInt(n.replace(/[$,]/g, '')));
  if (type === 'min') return parsed[0] || null;
  if (type === 'max') return parsed[parsed.length > 1 ? 1 : 0] || null;
  return null;
}
