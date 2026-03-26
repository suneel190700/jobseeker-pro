export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const THEIRSTACK_BASE = 'https://api.theirstack.com/v1';
const THEIRSTACK_KEY = process.env.THEIRSTACK_API_KEY || '';
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
    const jobId = searchParams.get('job_id') || '';

    // Build cache key from search params
    if (!THEIRSTACK_KEY) return NextResponse.json({ error: 'Job search not configured. Add THEIRSTACK_API_KEY in Vercel.', jobs: [] }, { status: 503 });
    const cacheKey = `${query.toLowerCase().trim()}|${location.toLowerCase().trim()}|${remote}|${datePosted}|${employmentType}|${page}`;

    // Step 1: Check cache
    const supabase = getSupabase();
    if (supabase && !jobId) {
      try {
        const cacheExpiry = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
        const { data: cached } = await supabase
          .from('cached_jobs')
          .select('*')
          .eq('query_key', cacheKey)
          .gte('fetched_at', cacheExpiry)
          .order('posted_date', { ascending: false });

        if (cached && cached.length >= 5) {
          console.log(`Cache HIT: ${cached.length} jobs for "${query}"`);
          const jobs = cached.map(mapCachedJob);
          return NextResponse.json({ jobs, count: jobs.length, page, hasMore: jobs.length >= 15, source: 'cache' });
        }
        console.log(`Cache MISS for "${query}" - fetching from TheirStack`);
      } catch (e) { console.error('Cache read error:', e); }
    }

    // Step 2: Fetch from TheirStack
    const jobs = await fetchTheirStack(query, location, remote, datePosted, employmentType, page);

    // Step 3: Cache results in background
    if (supabase && jobs.length > 0 && !jobId) {
      cacheJobs(supabase, cacheKey, jobs).catch(e => console.error('Cache write error:', e));
    }

    return NextResponse.json({ jobs, count: jobs.length, page, hasMore: jobs.length >= 15, source: 'theirstack' });
  } catch (error: any) {
    console.error('Job search error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs.', jobs: [] }, { status: 500 });
  }
}

async function fetchTheirStack(query: string, location: string, remote: boolean, datePosted: string, employmentType: string, page: number): Promise<MappedJob[]> {
  try {
    const body: any = {
      page: page - 1,
      limit: 25,
      job_title_or: [query],
      posted_at_max_age_days: 30,
      order_by: [{ desc: true, field: 'date_posted' }],
    };

    // Location filter
    if (location) {
      body.job_location_pattern_or = [location];
    } else {
      body.job_country_code_or = ['US'];
    }

    // Remote filter
    if (remote) body.remote = true;

    // Date filter
    if (datePosted === 'today') body.posted_at_max_age_days = 1;
    else if (datePosted === '3days') body.posted_at_max_age_days = 3;
    else if (datePosted === 'week') body.posted_at_max_age_days = 7;
    else if (datePosted === 'month') body.posted_at_max_age_days = 30;

    // Employment type
    if (employmentType) {
      const typeMap: Record<string, string> = { fulltime: 'full-time', parttime: 'part-time', contract: 'contract', intern: 'internship' };
      if (typeMap[employmentType]) body.job_type_or = [typeMap[employmentType]];
    }

    console.log('TheirStack request:', JSON.stringify(body).slice(0, 200));

    const r = await fetch(`${THEIRSTACK_BASE}/jobs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${THEIRSTACK_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('TheirStack error:', r.status, errText.slice(0, 300));
      return [];
    }

    const data = await r.json();
    console.log('TheirStack returned:', data.data?.length || 0, 'jobs');
    if (data.data?.[0]) console.log('TheirStack first item keys:', Object.keys(data.data[0]).join(', '));
    if (data.data?.[0]) console.log('TheirStack company fields:', JSON.stringify({ company_name: data.data[0].company_name, company: data.data[0].company, company_object: data.data[0].company_object, employer: data.data[0].employer, employer_name: data.data[0].employer_name }).slice(0, 300));

    return (data.data || []).map(mapTheirStackJob);
  } catch (e: any) {
    console.error('TheirStack fetch error:', e.message);
    return [];
  }
}

function mapTheirStackJob(item: any): MappedJob {
  const salary = item.min_annual_salary || item.salary_min || null;
  const salaryMax = item.max_annual_salary || item.salary_max || null;

  return {
    id: `ts_${item.id || Math.random().toString(36).slice(2)}`,
    title: item.job_title || item.title || 'Untitled',
    company: item.company_name || item.company_object?.name || item.company?.name || item.company?.display_name || item.employer_name || item.employer || (typeof item.company === 'string' ? item.company : '') || 'Unknown',
    location: item.location || item.job_location || 'US',
    remote_type: item.remote ? 'remote' : 'onsite',
    description: item.description || item.job_description || '',
    salary_min: salary ? Math.round(salary / 1000) * 1000 : null,
    salary_max: salaryMax ? Math.round(salaryMax / 1000) * 1000 : null,
    posted_date: item.date_posted || item.discovered_at || new Date().toISOString(),
    source_url: item.url || item.apply_url || item.job_url || '#',
    source: item.source || 'TheirStack',
    employment_type: item.job_type || '',
  };
}

function mapCachedJob(row: any): MappedJob {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location || 'US',
    remote_type: row.remote_type || 'onsite',
    description: row.description || '',
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    posted_date: row.posted_date || row.fetched_at,
    source_url: row.source_url || '#',
    source: row.source || 'TheirStack',
    employment_type: row.employment_type || '',
  };
}

async function cacheJobs(supabase: any, queryKey: string, jobs: MappedJob[]) {
  // Delete old cache for this query
  await supabase.from('cached_jobs').delete().eq('query_key', queryKey);

  // Insert new
  const rows = jobs.map(j => ({
    id: j.id,
    query_key: queryKey,
    title: j.title,
    company: j.company,
    location: j.location,
    remote_type: j.remote_type,
    description: j.description,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    posted_date: j.posted_date,
    source_url: j.source_url,
    source: j.source,
    employment_type: j.employment_type,
    fetched_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('cached_jobs').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Cache upsert error:', error.message);
  else console.log(`Cached ${rows.length} jobs for "${queryKey.split('|')[0]}"`);
}
