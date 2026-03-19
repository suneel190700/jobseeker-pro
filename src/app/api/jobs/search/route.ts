import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/jobs-api';
import type { JobSearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: JobSearchFilters = {
      query: searchParams.get('query') || 'software engineer',
      location: searchParams.get('location') || undefined,
      remote_only: searchParams.get('remote') === 'true',
      date_posted: (searchParams.get('date_posted') as any) || undefined,
      employment_type: (searchParams.get('type') as any) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
    };

    const jobs = await searchJobs(filters);

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs.' },
      { status: 500 }
    );
  }
}
