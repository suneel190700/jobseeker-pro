export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: 'Job search API not configured. Please add RAPIDAPI_KEY.', jobs: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software engineer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote') === 'true';
    const datePosted = searchParams.get('date_posted') || '';
    const employmentType = searchParams.get('type') || '';
    const page = searchParams.get('page') || '1';

    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page,
      num_pages: '1',
    });
    if (datePosted) params.set('date_posted', datePosted);
    if (remote) params.set('remote_jobs_only', 'true');
    if (employmentType) params.set('employment_types', employmentType.toUpperCase());

    const res = await fetch(`${JSEARCH_BASE}/search?${params}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('JSearch error:', res.status, text);
      return NextResponse.json(
        { error: `Job search API error: ${res.status}`, jobs: [] },
        { status: 502 }
      );
    }

    const data = await res.json();

    const jobs = (data.data || []).map((item: any) => ({
      id: item.job_id || Math.random().toString(36).slice(2),
      title: item.job_title || 'Untitled',
      company: item.employer_name || 'Unknown',
      company_logo: item.employer_logo || null,
      location: item.job_city
        ? `${item.job_city}, ${item.job_state || ''}`
        : item.job_country || 'Unknown',
      remote_type: item.job_is_remote ? 'remote' : 'onsite',
      description: item.job_description || '',
      salary_min: item.job_min_salary,
      salary_max: item.job_max_salary,
      posted_date: item.job_posted_at_datetime_utc || new Date().toISOString(),
      source_url: item.job_apply_link || item.job_google_link || '#',
      source: 'jsearch',
      employment_type: item.job_employment_type || '',
    }));

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error: any) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs.', jobs: [] },
      { status: 500 }
    );
  }
}
